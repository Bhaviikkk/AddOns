-- Insert sample data for testing

-- Sample projects
INSERT INTO projects (name, description, url, project_type, status) VALUES
('E-commerce Website', 'Analysis of main e-commerce platform', 'https://example-shop.com', 'website', 'completed'),
('React Dashboard', 'Internal admin dashboard codebase', 'https://github.com/company/dashboard', 'codebase', 'pending'),
('Landing Page', 'Marketing website analysis', 'https://marketing-site.com', 'website', 'analyzing');

-- Sample function maps for the first project
INSERT INTO function_maps (project_id, function_name, description, parameters, return_type, file_path, line_number, complexity_score, ai_analysis) VALUES
(1, 'addToCart', 'Adds product to shopping cart with quantity validation', '{"productId": "string", "quantity": "number"}', 'Promise<CartItem>', '/src/cart/cart-service.js', 45, 6, '{"insights": ["Handles edge cases well", "Could benefit from error logging"], "suggestions": ["Add input validation", "Implement retry logic"]}'),
(1, 'processPayment', 'Handles payment processing with multiple providers', '{"amount": "number", "paymentMethod": "string", "userId": "string"}', 'Promise<PaymentResult>', '/src/payment/payment-processor.js', 123, 8, '{"insights": ["Complex payment flow", "Good error handling"], "suggestions": ["Extract provider logic", "Add transaction logging"]}'),
(1, 'validateUser', 'User authentication and authorization', '{"token": "string", "permissions": "array"}', 'Promise<User>', '/src/auth/auth-service.js', 67, 4, '{"insights": ["Simple and effective", "Well documented"], "suggestions": ["Add rate limiting", "Implement session management"]}');
