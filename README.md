# QR-Based Guard Attendance & Patrol Proof System

A comprehensive digital workforce monitoring platform designed for security companies to track guard attendance and verify patrol activities using QR code scanning technology.

## 🎯 Features

### Core Functionality
- **QR-Based Guard Attendance** - Check-in/check-out with unique QR codes
- **Patrol Verification** - Multiple QR checkpoints for patrol validation
- **Real-time Monitoring** - Live dashboard for supervisors and admins
- **Multi-Site Management** - Manage multiple client locations
- **Role-Based Access** - Admin, Supervisor, Guard, and Client portals
- **Automated Reporting** - Generate attendance and patrol reports

### User Roles
- **Admin**: Full system access, user management, system configuration
- **Supervisor**: Monitor assigned sites, guard performance, patrol completion
- **Guard**: Mobile interface for QR scanning, attendance marking, patrol tracking
- **Client**: View-only access to verify security services at their locations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Bun or npm package manager
- SQLite (included)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd qr-guard-system
   bun install
   ```

2. **Set up the database**
   ```bash
   bun run db:push
   bun run db:seed
   ```

3. **Start the development server**
   ```bash
   bun run dev
   ```

4. **Access the application**
   - Open http://localhost:3000 in your browser
   - Use the demo credentials below to login

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@guardsecurity.com | admin123 |
| Client | client@company.com | client123 |
| Supervisor | supervisor@guardsecurity.com | supervisor123 |
| Guard | mike@guardsecurity.com | guard123 |
| Guard | sarah@guardsecurity.com | guard123 |
| Guard | tom@guardsecurity.com | guard123 |

## 📱 How It Works

### For Guards
1. Login using assigned credentials
2. Scan QR code at site entrance for check-in
3. Scan patrol point QR codes during rounds
4. Scan QR code again for check-out
5. View attendance history and patrol completion

### For Supervisors
1. Monitor real-time guard attendance
2. Track patrol completion across sites
3. Identify late check-ins and missed patrols
4. Generate reports for management review

### For Clients
1. Access view-only dashboard
2. Verify guard presence at your locations
3. Review daily security logs
4. Download monthly service reports

### For Admins
1. Complete system management
2. User and role management
3. Site and QR code management
4. System configuration and settings

## 🏗️ Technical Architecture

### Frontend
- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **NextAuth.js** for authentication

### Backend
- **Next.js API Routes** for server-side logic
- **Prisma ORM** with SQLite database
- **bcryptjs** for password hashing
- **QRCode** library for QR generation

### Database Schema
- **Users** with role-based profiles
- **Sites** for client locations
- **QR Codes** for attendance and patrol points
- **Attendance Records** for check-in/out tracking
- **Patrol Scans** for patrol verification
- **Reports** for automated reporting

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── qrcodes/       # QR code management
│   │   ├── scan/          # QR scanning logic
│   │   └── sites/         # Site management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── guard-scanner.tsx # Guard mobile interface
│   └── providers.tsx     # Session provider
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript definitions
    └── next-auth.d.ts    # Auth type extensions
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Database Management
```bash
# Push schema changes
bun run db:push

# Generate Prisma client
bun run db:generate

# Reset database
bun run db:reset

# Seed with sample data
bun run db:seed
```

## 🎨 UI Components

The system uses a comprehensive set of shadcn/ui components:
- Authentication forms
- Data tables with sorting/filtering
- QR code scanner interface
- Dashboard widgets and charts
- Modal dialogs and forms
- Responsive navigation

## 🔒 Security Features

- **Password Hashing** - bcryptjs for secure password storage
- **Role-Based Access Control** - Restrict access based on user roles
- **Session Management** - Secure NextAuth.js sessions
- **Input Validation** - Server-side validation for all inputs
- **QR Code Security** - Unique, time-stamped QR codes

## 📊 Reporting System

### Available Reports
- Daily attendance summaries
- Guard performance metrics
- Site-wise security logs
- Patrol completion statistics
- Monthly service summaries

### Report Features
- Real-time data aggregation
- Export to PDF functionality
- Custom date ranges
- Client-ready formatting

## 🚀 Deployment

### Production Build
```bash
bun run build
bun run start
```

### Environment Setup
1. Set production environment variables
2. Configure database connection
3. Set up SSL certificates
4. Configure domain and DNS

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers

### QR Codes
- `GET /api/qrcodes` - List QR codes
- `POST /api/qrcodes` - Generate new QR code

### Scanning
- `POST /api/scan` - Process QR scan (attendance/patrol)

### Sites
- `GET /api/sites` - List sites (role-filtered)
- `POST /api/sites` - Create new site

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Business Value

### For Security Companies
- Eliminate manual attendance registers
- Provide verifiable service records
- Improve operational efficiency
- Strengthen client trust
- Reduce administrative workload

### For Clients
- Transparent service verification
- Real-time guard presence confirmation
- Professional security reports
- Improved accountability

---

**QR Guard System** - Transforming security workforce management with digital innovation.