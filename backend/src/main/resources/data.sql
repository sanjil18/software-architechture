-- Traffic Fine System - Seed Data

-- Fine Categories
INSERT INTO fine_categories (category_code, name, description, default_amount) VALUES
('CAT001', 'Speeding', 'Exceeding the speed limit', 2500.00),
('CAT002', 'Red Light Violation', 'Passing a red traffic signal', 3000.00),
('CAT003', 'No Helmet', 'Motorcycle rider without helmet', 1500.00),
('CAT004', 'No Seat Belt', 'Driver or passenger without seat belt', 2000.00),
('CAT005', 'Drunk Driving', 'Driving under influence of alcohol', 25000.00),
('CAT006', 'No Licence', 'Driving without a valid licence', 5000.00),
('CAT007', 'Illegal Parking', 'Parking in a no-parking zone', 1000.00),
('CAT008', 'Mobile Phone Use', 'Using mobile phone while driving', 2000.00),
('CAT009', 'Overloading', 'Vehicle overloaded beyond capacity', 3500.00),
('CAT010', 'No Insurance', 'Driving without valid insurance', 4000.00);

-- Default admin user (password: admin123)
INSERT INTO users (username, password, role, enabled) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6MpCG', 'ADMIN', true);

-- Sample officer
INSERT INTO officers (badge_number, name, phone_number, district, station) VALUES
('OFF001', 'Sgt. Perera', '+94771234567', 'Colombo', 'Kollupitiya'),
('OFF002', 'Sgt. Silva', '+94777654321', 'Kandy', 'Kandy Central'),
('OFF003', 'Sgt. Fernando', '+94712345678', 'Galle', 'Galle Fort');

-- Officer user accounts (password: officer123)
INSERT INTO users (username, password, role, officer_id, enabled) VALUES
('officer1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6MpCG', 'OFFICER', 1, true),
('officer2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6MpCG', 'OFFICER', 2, true);
