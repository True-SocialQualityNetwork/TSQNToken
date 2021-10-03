const hre = require("hardhat")
require("@nomiclabs/hardhat-web3")
const fs = require("fs-extra")

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

async function main() {
	fs.removeSync("cache")
	fs.removeSync("artifacts")
	await hre.run("compile")

	// We get the contract to deploy
	const Vesting = await hre.ethers.getContractFactory("Vesting")
	console.log("Deploying Contract...")

	let network = process.env.NETWORK ? process.env.NETWORK : "rinkeby"
	console.log(">-> Network is set to " + network)

	// ethers is avaialble in the global scope
	const [deployer] = await ethers.getSigners()
	const deployerAddress = await deployer.getAddress()
	const account = await web3.utils.toChecksumAddress(deployerAddress)
	const balance = await web3.eth.getBalance(account)

	console.log(
		"Deployer Account " + deployerAddress + " has balance: " + web3.utils.fromWei(balance, "ether"),
		"ETH"
	)

	//bsc mainnet: ??
	//bsc testnet: 0x65E9B9BB12479172B088238c236aA4f8e364B1CB
	const tokenAddress = "0x65E9B9BB12479172B088238c236aA4f8e364B1CB"
	let deployed = await Vesting.deploy(tokenAddress)
	let dep = await deployed.deployed()

	await sleep(45000) // 40 seconds sleep
	await hre.run("verify:verify", {
		address: dep.address,
		constructorArguments: [tokenAddress],
	})
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
