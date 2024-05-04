CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE Events (
    event_id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES Users(user_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_canceled BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE Invitations (
    invitation_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES Events(event_id),
    invitee_id INTEGER NOT NULL REFERENCES Users(user_id),
    status ENUM('Awaiting', 'Accepted', 'Rejected'),
    sent_time TIMESTAMP NOT NULL,
    response_time TIMESTAMP
);

CREATE TABLE User_Availability (
    availability_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(user_id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_available BOOLEAN NOT NULL
);

CREATE TABLE Notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(user_id),
    event_id INTEGER NOT NULL REFERENCES Events(event_id),
    notification_type ENUM('Reminder', 'Cancellation'),
    message TEXT,
    notification_time TIMESTAMP NOT NULL
);

CREATE TABLE Agenda (
    agenda_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(user_id),
    event_id INTEGER REFERENCES Events(event_id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    reminder_time TIMESTAMP,
    status ENUM('Scheduled', 'Completed', 'Canceled')
);
