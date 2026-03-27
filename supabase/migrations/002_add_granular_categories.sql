-- Add granular categories to reduce the "Others" bucket
-- These cover common Groww review themes not captured by the original 14

INSERT INTO categories (name, slug) VALUES
  ('General Praise', 'general-praise'),
  ('Investment & Trading', 'investment-trading'),
  ('Mutual Funds & SIP', 'mutual-funds-sip'),
  ('Charges & Fees', 'charges-fees'),
  ('Ease of Use', 'ease-of-use'),
  ('Reliability', 'reliability')
ON CONFLICT (slug) DO NOTHING;
