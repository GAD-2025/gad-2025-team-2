#!/usr/bin/env bash
set -euo pipefail

echo "Helper script: open two terminals and run the backend and frontend start scripts." 
echo "This script does NOT spawn terminals for you. Run the following in two separate terminals:"
echo
echo "Terminal 1: Backend"
echo "  cd backend && ./start-backend.sh"
echo
echo "Terminal 2: Frontend"
echo "  cd frontend && ./start-frontend.sh"
echo
echo "Notes:"
echo " - Do not paste comment lines beginning with '#' into your terminal; paste only the commands." 
echo " - If you prefer one-liner: open two terminals and run the two commands above." 
