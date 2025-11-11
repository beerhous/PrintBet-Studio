# Copilot Instructions for PrintBet Studio

## Project Overview

PrintBet Studio (投注工坊) is a professional lottery betting slip generation and printing system. The system supports OCR recognition, betting slip generation, and ESC/POS thermal printer output for various lottery types including basketball, football, and number-based lotteries.

## Architecture

This is a **full-stack web application** with the following components:

```
printbet-studio/
├── frontend/          # React 18 web application
├── backend/           # Node.js + Express API server
├── ocr_engine/        # Python-based OCR engine wrapper (Umi-OCR)
├── print_engine/      # ESC/POS printing engine
├── mappings/          # JSON configuration files for lottery encoding
└── tests/             # Automated test suite
```

## Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **Styling**: Styled Components 6.1.0
- **HTTP Client**: Axios 1.6.0
- **File Upload**: React Dropzone 14.2.3
- **Icons**: React Icons 4.11.0
- **Notifications**: React Toastify 9.1.3
- **Build Tool**: Create React App (react-scripts)

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.18.2
- **File Upload**: Multer 1.4.5-lts.1
- **CORS**: cors 2.8.5
- **Utilities**: fs-extra, uuid, moment
- **Python Integration**: python-shell 5.0.0

### Additional Technologies
- **OCR**: Umi-OCR (Python-based)
- **Printing Protocol**: ESC/POS
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx

## Building and Testing

### Installation
```bash
# Install all dependencies (root, frontend, backend)
npm run install-all

# Or install individually
cd frontend && npm install
cd backend && npm install
```

### Development
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately
npm run server:dev    # Backend on port 5000
npm run client:dev    # Frontend on port 3000
```

### Building
```bash
# Build frontend for production
npm run build
# or
cd frontend && npm run build
```

### Testing
```bash
# Run test suite
npm test
# or
cd tests && npm test
```

### Docker Deployment
```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Code Structure and Conventions

### Frontend Structure
- `frontend/src/components/` - React components
- `frontend/src/services/` - API service functions
- `frontend/public/` - Static assets
- Uses **functional components** with React Hooks
- Styled Components for component styling

### Backend Structure
- `backend/src/server.js` - Main Express server
- `backend/src/routes/` - API route handlers
- `backend/src/controllers/` - Business logic
- `backend/src/services/` - External service integrations
- RESTful API design

### Common Patterns
- **Chinese Language**: UI text and comments often use Chinese (中文)
- **Lottery Types**: 
  - `basketball` (竞彩篮球) - Basketball betting
  - `football` (竞彩足球) - Football betting  
  - `dlt` (大乐透) - Super Lotto
  - `pls` (排列三/五) - Pick 3/5
- **Encoding**: Custom encoding system in `mappings/` directory
- **Print Format**: ESC/POS commands for thermal printers (58mm/80mm)

## Key Files and Their Purpose

- `package.json` - Root package with scripts for running/building the app
- `frontend/package.json` - Frontend dependencies (React app)
- `backend/package.json` - Backend dependencies (Express API)
- `docker-compose.yml` - Multi-container deployment configuration
- `deploy.sh` - Automated deployment script
- `mappings/*.json` - Lottery type encoding configurations
- `nginx.conf` - Nginx reverse proxy configuration

## Common Commands

```bash
# Development
npm run dev                 # Start both frontend and backend in dev mode
npm run server             # Start backend only
npm run client             # Start frontend only

# Testing
npm test                   # Run all tests

# Building
npm run build              # Build frontend for production

# Deployment
./deploy.sh                # Automated deployment
docker-compose up -d       # Docker deployment
```

## Coding Guidelines

### When Making Changes

1. **Minimal Changes**: Make the smallest possible changes to accomplish the task
2. **Preserve Chinese Content**: Keep Chinese UI text and comments unless specifically asked to change
3. **Test After Changes**: Always run tests after modifying code
4. **Follow Existing Patterns**: Match the coding style of existing files
5. **No Unnecessary Refactoring**: Don't refactor working code unless it's part of the task

### Technology Preferences

- **Frontend**: Use functional components with hooks (not class components)
- **Backend**: Use async/await for asynchronous operations
- **Testing**: Follow existing test patterns in `tests/` directory
- **Dependencies**: Only add new dependencies if absolutely necessary
- **Documentation**: Update README.md if adding significant features

### File Modifications

- **Frontend Changes**: Typically in `frontend/src/`
- **Backend Changes**: Typically in `backend/src/`
- **API Changes**: Update both routes and controllers
- **Lottery Logic**: Check `mappings/` for encoding configurations
- **Print Logic**: Check `print_engine/` for ESC/POS formatting

## Domain-Specific Knowledge

### Lottery Betting Concepts
- **SF (胜负)**: Win/Lose
- **RFSF (让分胜负)**: Handicap Win/Lose
- **SFC (胜分差)**: Win Margin
- **DXF (大小分)**: Over/Under
- **BIFEN (比分)**: Exact Score
- **SPF (胜平负)**: Win/Draw/Lose
- **Multiplier (倍数)**: Number of times to multiply the bet

### Print Formats
- **58mm**: Narrow thermal paper (common in small shops)
- **80mm**: Wide thermal paper (standard size)
- **ESC/POS**: Standard printer command set
- **Base64**: Encoded print commands for transmission

## Troubleshooting

### Common Issues
- **Port Conflicts**: Frontend runs on 3000, backend on 5000
- **Proxy Issues**: Frontend proxy configured in `frontend/package.json`
- **OCR Dependencies**: Requires Python and Umi-OCR installation
- **Print Testing**: Use test mode if no physical printer available

### Dependencies
- If OCR is not working, check Python environment and Umi-OCR installation
- If printing fails, verify ESC/POS command generation in print_engine
- For CORS issues, check backend `cors` configuration

## Best Practices for AI Assistance

1. **Understand Context**: This is a Chinese lottery system - respect cultural and domain specifics
2. **Test Integration**: Test with both frontend and backend running together
3. **Check Documentation**: Review README.md, PROJECT_SUMMARY.md for project status
4. **Preserve Functionality**: The system has working OCR, betting, and printing - don't break these
5. **Ask When Uncertain**: If lottery domain knowledge is needed, ask for clarification

## Security Notes

- Never commit sensitive credentials
- Validate all user inputs in API endpoints
- Sanitize file uploads (OCR images)
- Use environment variables for configuration
- Follow secure coding practices for Express.js

## Additional Resources

- **README.md**: User-facing documentation and setup guide
- **PROJECT_SUMMARY.md**: Complete project accomplishments and technical details
- **SYSTEM_DEMO.md**: System demonstration and features
- **FILE_LIST.md**: Detailed file structure reference
