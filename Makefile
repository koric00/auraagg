.PHONY: setup dev test test-integration test-fuzzing deploy-testnet deploy-mainnet

setup:
	@echo "Setting up development environment..."
	# Install Rust dependencies
	@echo "Please install Rust from https://rustup.rs/ if not already installed"
	# Install Python dependencies
	@echo "Please install Python 3.10+ if not already installed"
	pip install -r requirements.txt
	# Install Node.js dependencies
	@echo "Please install Node.js 18+ if not already installed"
	cd contracts && npm install
	cd sdk && npm install

dev:
	@echo "Starting development environment..."
	docker-compose up -d

test:
	@echo "Running unit tests..."
	cd router-engine && cargo test
	cd contracts && npx hardhat test

test-integration:
	@echo "Running integration tests..."
	cd tests && pytest integration/

test-fuzzing:
	@echo "Running fuzzing tests..."
	cd contracts && npx hardhat run scripts/fuzz.js

deploy-testnet:
	@echo "Deploying to testnet..."
	cd contracts && npx hardhat run scripts/deploy.js --network testnet

deploy-mainnet:
	@echo "Deploying to mainnet..."
	cd contracts && npx hardhat run scripts/deploy.js --network mainnet 