-- Insert sample data for testing and development

-- Sample client companies
INSERT INTO client_companies (name, address, city, province, postal_code, phone, email, website)
VALUES 
  ('Snowdown Developments', '123 Business Ave', 'Vancouver', 'BC', 'V6B 1A1', '604-555-1234', 'info@snowdown.com', 'snowdown.com'),
  ('Cert Demo', '456 Construction Blvd', 'Vancouver', 'BC', 'V6C 2B2', '604-555-5678', 'info@certdemo.com', 'certdemo.com');

-- Sample cost codes
INSERT INTO cost_codes (code, name, description)
VALUES 
  ('01-100', 'General Requirements', 'Project management, permits, temp facilities'),
  ('02-100', 'Site Work', 'Demolition, earthwork, site utilities'),
  ('03-100', 'Concrete', 'Formwork, reinforcement, cast-in-place'),
  ('06-100', 'Wood & Plastics', 'Rough carpentry, finish carpentry, architectural woodwork'),
  ('09-100', 'Finishes', 'Drywall, painting, flooring, ceilings'),
  ('15-100', 'Mechanical', 'Plumbing, HVAC, fire protection'),
  ('16-100', 'Electrical', 'Service/distribution, lighting, devices');

-- Note: Add more seed data as needed for your specific testing scenarios