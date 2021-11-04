require("@nomiclabs/hardhat-waffle")
require("dotenv").config()
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-web3")
require("@nomiclabs/hardhat-etherscan")

module.exports = {
	solidity: {
		version: "0.8.7",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		hardhat: {
			chainId: 127001,
			accounts: {
				mnemonic: "test test test test test test test test test test test junk",
			},
			blockGasLimit: 199022552,
			gas: 1500000,
			gasPrice: 100,
			allowUnlimitedContractSize: false,
			throwOnTransactionFailures: false,
			throwOnCallFailures: true,
		},
		ganache: {
			url: "http://127.0.0.1:7545",
			blockGasLimit: 10000000,
		},
		mainnet: {
			url: process.env.MAINNET_RPC,
			gas: 2500000,
			gasPrice: 37000000000, //37 gwei
			timeout: 99000,
			accounts: [process.env.PRIVATE_KEY],
		},
		rinkeby: {
			url: process.env.RINKEBY_RPC,
			network_id: 4,
			gas: 1500000,
			gasPrice: 10000000000, //10 gwei
			timeout: 15000,
			accounts: [process.env.PRIVATE_KEY],
		},
		bsc_test: {
			url: process.env.BSC_RPC_TEST,
			network_id: 97,
			gasPrice: 20000000000, //20 gwei
			accounts: [process.env.PRIVATE_KEY],
		},
		bsc: {
			url: process.env.BSC_RPC,
			network_id: 56,
			gasPrice: 20000000000, //20 gwei
			accounts: [process.env.PRIVATE_KEY],
		},
		matictest: {
			url: "https://rpc-mumbai.maticvigil.com",
			accounts,
			network_id: 80001
			accounts: [process.env.PRIVATE_KEY],
		},
		matic:{
			url: "https://polygon-rpc.com",
			accounts,
			network_id: 137
			accounts: [process.env.PRIVATE_KEY],
		}
	},

	gasReporter: {
		enabled: !!process.env.REPORT_GAS === true,
		currency: "USD",
		gasPrice: 100,
		showTimeSpent: true,
		coinmarketcap: process.env.COINMARKETCAP_API,
	},
	mocha: {
		timeout: 25000,
	},
	etherscan: {
		apiKey: process.env.BSC_SCAP_API_KEY,
	},
}
