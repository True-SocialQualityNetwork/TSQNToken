<template>
  <v-container>
    <div class="main-block">
      <p>
        Minutes is a collection of 1440 unique clock image NFTs on the Ethereum
        blockchain, one for each minute of the day:
      </p>

      <img
        src="https://minutesnftt.netlify.app/images/ampm.gif"
        alt="ampm gif"
      />

      <p>
        Time is the most valuable thing. <br />
        Mint your Minutes, before time runs out.
      </p>

      <p class="m-right">
        .05 ETH per mint <br />
        1440 unique NFTs
        <br />
        <br />
        <p v-if="totalMinted > 0">{{totalMinted}}/1440 minted</p>
      </p>
    </div>

    <p
      v-if="totalMinted && totalMinted > 1439"
      class="display-1 ma-5 subtitle text-xs-center justify-center"
      style="text-align: center; font-weight: bold"
    >
      <br /><br />
      <span class="display-3 glow" style="font-weight: bold">SOLD OUT! </span>
      <br />
      <br />
      Thank you for participating!<br /><br />
    </p>

    <v-form v-if="totalMinted < 1439" lazy-validation>
      <div class="search-form__row">
        <v-card elevation="0" class="ma-5">
          <v-container>
            <v-row>
              <v-col cols="16" md="4">
                <v-select
                  :items="Array.from({ length: 10 }, (_, i) => i + 1)"
                  class="quantity-input text-center"
                  label="Qty"
                  v-model="amount"
                  solo
                  required
                >
                  <template slot="selection" slot-scope="{ item }">
                    <span class="mx-auto qty-amount" style="padding-left: 30px">
                      {{ item }}
                    </span>
                  </template>
                </v-select>
                <p>Qty</p>
              </v-col>

              <v-col cols="16" md="8">
                <v-btn
                  large
                  block
                  solo
                  class="mint-btn"
                  @click="
                    errorText = ''
                    buyNFT()
                  "
                >
                  Mint Minutes
                </v-btn>
                <p>.05 ETH/each</p>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </div>
    </v-form>

    <v-card
      v-if="txHash"
      style="text-align: center"
      class="pa-5 ma-5 text-xs-center justify-center"
      color="#333"
    >
      <p style="text-align: center" class="title ma-5">
        You can check the transaction status
        <span style="font-weight: bold"
          ><a target="_blank" :href="`https://etherscan.io/tx/${txHash}`"
            >here</a
          ></span
        >

        <img
          src="/toker.gif"
          class="text-xs-center justify-center"
          style="
            margin: 15px;
            height: 450px;
            vertical-align: middle;
            margin: auto;
            text-align: center;
          "
          alt="toker gif"
        />
      </p>
      <p style="text-align: center">
        In a few minutes, your NFT will show up in Opensea<br />
        <span style="font-weight: bold">
          <a target="_blank" href="https://opensea.io/collection/????"
            >opensea.io/collection/????</a
          ></span
        >
      </p>
      <br />
    </v-card>

    <v-dialog v-model="dialogError" class="ma-5 pa-5" max-width="600px">
      <v-card class="warning">
        <v-card-title>
          <span>{{ errorText }}</span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="blue darken-1"
            text
            @click="
              dialogError = false
              errorText = ''
            "
          >
            EXIT
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ethers } from 'ethers'
import { CONTRACT_ADDR, RPC_PROVIDER, NETWORK_ID } from '../constants'
import { ERC721_ABI } from '../erc721_abi'
const EthersUtils = require('ethers').utils

export default {
  auth: false,
  data() {
    return {
      id: null,
      totalMinted: null,
      amount: 10,
      dialogConfirmation: false,
      catID: null,
      adoptedCats: null,
      tokenID: null,
      contract: null,
      contractAddress: null,
      itemPriceETH: null,
      itemPriceWei: null,
      txHash: null,
      isOwned: false,
      isSaleActive: false,
      ethers: null,
      signer: null,
      provider: null,
      errorText: '',
      dialogAdoptMany: false,
      dialogError: false,
      walletAddress: null,
      showRandNFTs: false,
    }
  },
  mounted() {
    this.id = this.$route.query.id
    this.contractAddress = CONTRACT_ADDR

    this.initialize()

    const timer = setInterval(() => {
      this.timerOperations()
    }, 15000)

    this.$once('hook:beforeDestroy', () => {
      clearInterval(timer)
    })
  },
  methods: {
    initialize() {
      this.provider = 'not_web3'
      this.ethers = new ethers.providers.JsonRpcProvider(
        RPC_PROVIDER,
        NETWORK_ID
      )
      this.contract = new ethers.Contract(
        CONTRACT_ADDR,
        ERC721_ABI,
        this.ethers
      )
      setTimeout(this.timerOperations, 1000)
    },
    async timerOperations() {
      this.totalMinted = Number(await this.contract.totalSupply())
      console.log('Total minted = ', this.totalMinted)
      this.isSaleActive = Number(await this.contract.isSaleActive())
      console.log('isSaleActive = ', this.isSaleActive)
    },
    async buyNFT() {
      if (this.isSaleActive == 0) {
        this.dialogError = true
        this.errorText = 'Join our Discord group for pre-mint whitelist access'
        return
      }
      if (this.totalMinted > 1439) {
        this.dialogError = true
        this.errorText = 'sold out'
        return
      }
      if (Number(this.amount) < 0) {
        this.$toast.error('invalid amount')
        return
      }
      if (Number(this.amount) > 10) {
        this.$toast.error('maximum 10 NFTs at a time')
        return
      }

      this.txHash = null

      this.ethers = new ethers.providers.Web3Provider(window.ethereum, 'any')
      await this.ethers.send('eth_requestAccounts', [])

      this.signer = this.ethers.getSigner()
      this.contract = new ethers.Contract(
        CONTRACT_ADDR,
        ERC721_ABI,
        this.signer
      )

      try {
        const gasLimit = this.amount * 200000

        this.itemPriceWei = Number(50000000000000000)

        const overrides = {
          value: String(Number(this.amount) * Number(this.itemPriceWei)),
          gasLimit: gasLimit,
        }
        const tx = await this.contract.mint(this.amount, overrides)
        if (tx.hash) {
          this.$toast.info('transaction submitted successfully')
        }
        this.txHash = tx.hash
      } catch (err) {
        if (err.message.includes('denied')) {
          this.$toast.info('you canceled the transaction')
        } else {
          this.$toast.error(err.message)
        }
      }
    },
    async checkMetamaskConnected() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          'any'
        )
        // Prompt user for account connections
        await provider.send('eth_requestAccounts', [])

        this.signer = this.ethers.getSigner()
        this.account = await this.signer.getAddress()
        this.balance = await this.signer.getBalance()
        this.ethBalance = await ethers.utils.formatEther(this.balance)
        this.signer = this.ethers.getSigner()
        this.walletAddress = await this.signer.getAddress()
        this.walletBtnText =
          this.walletAddress.substr(0, 7) +
          '...' +
          this.walletAddress.substr(
            this.walletAddress.length - 5,
            this.walletAddress.length
          )

        const chainId = this.ethers._network.chainId
        this.$store.commit('setSelectedAddress', this.walletAddress)
        this.$store.commit('setNetworkID', Number(chainId))

        if (chainId !== 1) {
          this.showNonMainnetWarning = true
        }
        return true
      } else {
        this.$router.push('/other/install_metamask')
        return false
      }
    },
    viewOnOpenSea() {
      const url =
        'https://opensea.io/assets/' + this.contractAddress + '/' + this.id
      window.open(url, '_blank')
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  max-width: 1500px;
}
.black-text {
  color: black i !important;
}

.theme--dark.v-input input,
.theme--dark.v-input textarea {
  color: #ea700c;
}

.glow {
  -webkit-text-stroke: 1px #9fd8a3;
  text-shadow: 0 0 15px rgb(137 246 143 / 77%), 0 0 10px transparent;
  -webkit-text-fill-color: transparent;
}
.centered-input input {
  text-align: center;
}

.main-block {
  max-width: 560px;
  margin: auto;
  position: relative;
}

.main-block .m-right {
  position: absolute;
  top: 180px;
  right: -220px;
}

.main-block p {
  line-height: 1.6;
  text-align: center;
  font-size: 20px;
  margin: auto;
}

.main-block img {
  margin: 20px auto;
  max-width: 520px;
}

::v-deep .quantity-input {
  width: 180px;
}

::v-deep .quantity-input .v-input__slot {
  background: #ffffff !important;
  border-radius: 26px;
  height: 48px;
  margin: auto;
}

::v-deep .quantity-input .v-select__slot .v-select__selection,
::v-deep .quantity-input .qty-amount,
::v-deep .quantity-input select {
  color: #000000 !important;
  text-align: center;
  font-size: 16px !important;
  right: 0 !important;
}

::v-deep .quantity-input .v-text-field__details {
  display: none !important;
}

::v-deep .quantity-input .v-select__slot input {
  display: none;
}

::v-deep .mint-btn {
  height: 48px !important;
  border-radius: 26px;
  background: #ffffff !important;
  text-transform: initial !important;
  font-size: 16px;
  width: 250px;
  box-shadow: 1px 3px 0px #3e3e3e;
}

::v-deep .mint-btn .v-btn__content {
  color: #000000 !important;
}

::v-deep .mint-btn {
  will-change: transform;
  transition: transform 250ms;
}

::v-deep .mint-btn:hover {
  transform: translateY(-3px);
}

::v-deep .mint-btn:active {
  transform: translateY(0px);
}

.search-form__row p {
  line-height: 2;
  text-align: center;
  font-size: 20px;
  margin: auto;
}

@media (max-width: 767px) {
  .main-block img {
    width: 100%;
  }

  ::v-deep .quantity-input {
    width: 100%;
  }

  .main-block .m-right {
    position: relative !important;
    margin-top: 20px;
    top: 0;
    right: 0;
  }
}
</style>
