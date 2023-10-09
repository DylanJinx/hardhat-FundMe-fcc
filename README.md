# A contract of fundme and use hardhat with ethers.js

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

- Compile the contract:
```shell
  npx hardhat compile
```

- Deploy the contract:
```shell
npx hardhat deploy
# or
npx hardhat deploy --network localhost
# or
npx hardhat deploy --network sepolia
```

- Run tests:
```shell
npx hardhat test
# or for the staging network
npx hardhat test --network sepolia
```

- Lint the contract:
```shell
npx solhint 'contracts/*.sol'
# or to automatically fix issues
npx solhint 'contracts/*.sol' --fix
```

- Format the code:
```shell
npx prettier --write .
```

- Run coverage:
```shell
npx hardhat coverage
```
