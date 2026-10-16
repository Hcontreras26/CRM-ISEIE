-- 232 · Mensajería interna del equipo (Sistema → Mensajes), como en MultiCRM.
--
-- Paridad (Diego, 15/10: «tienen que estar en ambos CRM todas las cosas»). Es la
-- 064_messaging.sql de MultiCRM con el mismo esquema, pero reaplicable: todo va
-- con IF NOT EXISTS. ISEIE no tenía ninguna de las tres tablas.
--
-- Conversaciones directas entre dos personas del equipo, con el prospecto del que
-- se habla (opcional) y los mensajes. `last_read_at` por participante da los «no
-- leídos».

CREATE TABLE IF NOT EXISTS conversations (
    id            SERIAL        PRIMARY KEY,
    type          VARCHAR(20)   NOT NULL DEFAULT 'direct'
                                CHECK (type IN ('direct', 'group')),
    title         VARCHAR(255),
    lead_id       INTEGER       REFERENCES leads(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
    id                SERIAL        PRIMARY KEY,
    conversation_id   INTEGER       NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id           INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_read_at      TIMESTAMPTZ   NOT NULL DEFAULT '1970-01-01T00:00:00Z',
    joined_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_conv_participant UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON conversation_participants(conversation_id);

CREATE TABLE IF NOT EXISTS messages (
    id                 SERIAL        PRIMARY KEY,
    conversation_id    INTEGER       NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id          INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body               TEXT          NOT NULL CHECK (char_length(body) > 0),
    content_type       VARCHAR(20)   NOT NULL DEFAULT 'text',
    referenced_lead_id INTEGER       REFERENCES leads(id) ON DELETE SET NULL,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conv_type ON conversations(type);

-- Las tablas son del dueño de `leads` (aplicada como `postgres` nacerían suyas y la
-- API recibiría «permission denied»), y el usuario de la app que exista tiene acceso.
DO $$
DECLARE dueno text; r text; tab text;
BEGIN
  SELECT tableowner INTO dueno FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads';
  FOREACH tab IN ARRAY ARRAY['conversations', 'conversation_participants', 'messages'] LOOP
    IF dueno IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I OWNER TO %I', tab, dueno);
      EXECUTE format('ALTER SEQUENCE %I OWNER TO %I', tab || '_id_seq', dueno);
    END IF;
    FOREACH r IN ARRAY ARRAY['crm_user', 'crm_iseie_user'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO %I', tab, r);
        EXECUTE format('GRANT USAGE, SELECT, UPDATE ON SEQUENCE %I TO %I', tab || '_id_seq', r);
      END IF;
    END LOOP;
  END LOOP;
END $$;
