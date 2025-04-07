CREATE TABLE agenda (
    id SERIAL NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    user_id integer NOT NULL,
    artist_id integer NOT NULL DEFAULT 0,
    working_days jsonb NOT NULL DEFAULT '["1", "2", "3", "4", "5"]'::jsonb,
    public boolean NOT NULL DEFAULT false,
    open boolean NOT NULL DEFAULT true,
    deleted_at timestamp without time zone,
    PRIMARY KEY(id)
);
CREATE INDEX IDX_c9083b6cdc404ea78948b7b625 ON agenda USING btree (artist_id);


CREATE TABLE quotation (
    id SERIAL NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    customer_id integer NOT NULL,
    artist_id integer NOT NULL,
    description text NOT NULL,
    work_evidence jsonb,
    reference_images jsonb,
    estimated_cost numeric(10, 2),
    status varchar NOT NULL DEFAULT 'pending', -- Possible values: 'pending', 'accepted', 'rejected', 'appealed'
    response_date timestamp without time zone, -- Fecha en que el artista responde a la cotización
    appointment_date timestamp without time zone, -- Fecha y hora de la cita propuesta por el artista
    appointment_duration integer, -- Duración de la cita en horas
    PRIMARY KEY(id),
    FOREIGN KEY(customer_id) REFERENCES users(id),
    FOREIGN KEY(artist_id) REFERENCES users(id)
);


CREATE TABLE agenda_event (
    id SERIAL NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    customer_id integer,
    title varchar NOT NULL,
    start timestamp without time zone NOT NULL,
    end timestamp without time zone NOT NULL,
    color varchar NOT NULL,
    info varchar NOT NULL,
    notification boolean NOT NULL DEFAULT false,
    done boolean NOT NULL DEFAULT false,
    deleted_at timestamp without time zone,
    quotation_id integer, -- Referencia a la cotización aceptada
    work_evidence jsonb,
    cancelation_reason varchar,
    PRIMARY KEY(id),
    CONSTRAINT FK_event_quotation_id FOREIGN key(quotation_id) REFERENCES quotation(id)
);
CREATE INDEX IDX_430a191d6a4bd0f4d89d55234a ON agenda_event USING btree (start, end);

CREATE TABLE agenda_event_history(
    id SERIAL NOT NULL,
    title varchar NOT NULL,
    start timestamp without time zone NOT NULL,
    end timestamp without time zone NOT NULL,
    color varchar NOT NULL,
    info varchar NOT NULL,
    notification boolean NOT NULL DEFAULT false,
    done boolean NOT NULL DEFAULT false,
    cancelation_reason varchar,
    recorded_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_by integer NOT NULL,
    event_id integer,
    PRIMARY KEY(id),
    CONSTRAINT FK_23d67ae396d322090e5cc4fed29 FOREIGN key(event_id) REFERENCES agenda_event(id)
);

CREATE TABLE quotation_history (
    id SERIAL NOT NULL,
    quotation_id integer NOT NULL,
    status varchar NOT NULL,
    changed_at timestamp without time zone NOT NULL DEFAULT now(),
    changed_by integer NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(quotation_id) REFERENCES quotation(id),
    FOREIGN KEY(changed_by) REFERENCES users(id)
);