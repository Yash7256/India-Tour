-- Insert sample places
INSERT INTO public.places (name, description, city, state, country, latitude, longitude, main_image_url, rating)
VALUES
    ('Taj Mahal', 'An ivory-white marble mausoleum on the right bank of the river Yamuna', 'Agra', 'Uttar Pradesh', 'India', 27.1751, 78.0421, 'https://example.com/taj-mahal.jpg', 4.9),
    ('Jaipur City Palace', 'A palace complex in Jaipur, the capital of Rajasthan state, India', 'Jaipur', 'Rajasthan', 'India', 26.9255, 75.8236, 'https://example.com/city-palace.jpg', 4.7),
    ('Gateway of India', 'An arch-monument built in the early 20th century in Mumbai', 'Mumbai', 'Maharashtra', 'India', 18.9220, 72.8347, 'https://example.com/gateway.jpg', 4.6);

-- Note: In a production environment, you would want to add more seed data
-- and ensure the image URLs are valid and pointing to actual images
