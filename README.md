CampusEats – Online Food Delivery System
CampusEats is a web-based food delivery system that allows customers to browse restaurants, explore food menus, place orders, and follow delivery progress. Restaurants can manage menus and orders, delivery riders can handle deliveries, and administrators can manage the platform.

The project is designed for university campuses and nearby residential areas while also supporting general customers.
Features
Customer
- Register and log in
- Browse restaurants and food menus
- View food details, prices, and availability
- Add food to the cart and update quantities
- Place orders and select a delivery address
- View order status and delivery progress
- View order history
- Rate restaurants or food and submit reviews
Restaurant
- Manage restaurant information
- Add, update, and remove food items
- Manage food prices and availability
- View incoming orders
- Accept or reject orders and update order status
- View order history
Delivery Rider
- View assigned delivery requests
- Accept delivery requests
- Update delivery progress
- View delivery history
Admin
- Manage customers, restaurants, and delivery riders
- Review restaurant and rider approval requests
- Monitor and manage orders
- Manage platform access where supported
Note: Feature availability depends on the current implementation of the project.

Technology Stack
Layer	Technology
Frontend	React.js
Backend	PHP Laravel
Database	MySQL
API Communication	REST API
Development Tools	Node.js/npm, Composer, PHP, MySQL


Project Structure
A typical structure may look like this. Replace folder names with the actual names used in your repository.
CampusEats/
├── frontend/          # React.js application
├── backend/           # Laravel application
├── README.md
└── .gitignore
Requirements
Install the following before running the project:
- PHP version compatible with this project's Laravel version
- Composer
- Node.js and npm
- MySQL Server or XAMPP
- Git
Installation and Setup
1. Clone the Repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd CampusEats
Replace <YOUR_GITHUB_REPOSITORY_URL> with your GitHub repository URL.
2. Set Up the Laravel Backend
Open a terminal in the Laravel project directory:
cd backend
composer install
Create a local environment file.

Windows PowerShell:
Copy-Item .env.example .env
macOS/Linux:
cp .env.example .env
Generate the Laravel application key:
php artisan key:generate
3. Configure the MySQL Database
Create a database in MySQL, for example:
CREATE DATABASE campuseats;
Update the database settings in the Laravel .env file:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=campuseats
DB_USERNAME=root
DB_PASSWORD=
Change the username and password to match your local MySQL configuration.

If this project uses Laravel migrations, run:
php artisan migrate
If the project uses a provided SQL schema instead, import that schema into the campuseats database. Follow the setup method used by the project; do not run both methods blindly.
4. Start the Backend
From the Laravel project directory:
php artisan serve
Laravel is usually available at:
http://127.0.0.1:8000
5. Set Up and Start the React Frontend
Open another terminal and move to the React frontend directory:
cd frontend
npm install
If the frontend uses an environment variable for the API URL, configure it in the appropriate .env file. For example:
VITE_API_URL=http://127.0.0.1:8000/api
Use the environment variable name expected by your actual frontend code.

Start the frontend development server:
npm run dev
Open the local URL shown in the terminal, commonly:
http://localhost:5173
API and Authentication
The React frontend communicates with the Laravel backend through API endpoints. Protected endpoints should require authentication, and role-specific actions should be authorized by the backend.

Configure CORS and authentication according to the Laravel packages and settings used in this project.
Security Notes
- Never commit your real .env file, passwords, API keys, or private credentials.
- Keep .env.example with placeholder values.
- Do not commit vendor/ or node_modules/; these dependencies can be installed with Composer and npm.
- Use a strong database password outside local development.
- Verify permissions on the backend for customer, restaurant, rider, and admin operations.
Future Improvements
- Integrate a real online payment gateway
- Add real-time order tracking and notifications
- Improve location-based restaurant recommendations
- Add automated tests and deployment configuration
Contributors
Developed as a web engineering / software development project.

Add the team members and their roles here.
License
For educational and demonstration purposes unless a separate license is specified.
