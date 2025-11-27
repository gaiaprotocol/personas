"use strict";(self.webpackChunkpersonas=self.webpackChunkpersonas||[]).push([[5941],{45941:(e,t,o)=>{o.r(t),o.d(t,{AppKitModal:()=>Le,W3mListWallet:()=>Ge,W3mModal:()=>je,W3mModalBase:()=>He,W3mRouterContainer:()=>Je,W3mUsageExceededView:()=>Ze});var i=o(86161),a=o(25707),r=o(81413),n=o(57019),s=o(84833),c=o(60475),l=o(36010),d=o(88249),u=o(78508),p=o(94702),w=o(1122);const h={isUnsupportedChainView:()=>"UnsupportedChain"===u.I.state.view||"SwitchNetwork"===u.I.state.view&&u.I.state.history.includes("UnsupportedChain"),async safeClose(){this.isUnsupportedChainView()||await w.U.isSIWXCloseDisabled()?s.W.shake():("DataCapture"!==u.I.state.view&&"DataCaptureOtpConfirm"!==u.I.state.view||p.x.disconnect(),s.W.close())}};var m=o(68996),g=o(21871),y=o(68126),f=o(4707),v=o(45627),b=o(24376),k=o(10152),x=o(82933),T=o(74496),S=o(62944),A=o(26742),C=o(80036);const P={getGasPriceInEther:(e,t)=>Number(t*e)/1e18,getGasPriceInUSD(e,t,o){const i=P.getGasPriceInEther(t,o);return v.S.bigNumber(e).times(i).toNumber()},getPriceImpact({sourceTokenAmount:e,sourceTokenPriceInUSD:t,toTokenPriceInUSD:o,toTokenAmount:i}){const a=v.S.bigNumber(e).times(t),r=v.S.bigNumber(i).times(o);return a.minus(r).div(a).times(100).toNumber()},getMaxSlippage(e,t){const o=v.S.bigNumber(e).div(100);return v.S.multiply(t,o).toNumber()},getProviderFee:(e,t=.0085)=>v.S.bigNumber(e).times(t).toString(),isInsufficientNetworkTokenForGas(e,t){const o=t||"0";return!!v.S.bigNumber(e).eq(0)||v.S.bigNumber(v.S.bigNumber(o)).gt(e)},isInsufficientSourceTokenForSwap(e,t,o){const i=o?.find(e=>e.address===t)?.quantity?.numeric;return v.S.bigNumber(i||"0").lt(e)}};var $=o(35940),I=o(71655),W=o(75595),E=o(90184);const R=15e4;Error;const N={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,switchingTokens:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:"",sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:"",toTokenPriceInUSD:0,networkPrice:"0",networkBalanceInUSD:"0",networkTokenSymbol:"",inputError:void 0,slippage:S.oU.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:"0",gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},O=(0,y.BX)({...N}),D={state:O,subscribe:e=>(0,y.B1)(O,()=>e(O)),subscribeKey:(e,t)=>(0,f.u$)(O,e,t),getParams(){const e=c.W.state.activeChain,t=c.W.getAccountData(e)?.caipAddress??c.W.state.activeCaipAddress,o=A.w.getPlainAddress(t),i=(0,T.K1)(),a=l.a.getConnectorId(c.W.state.activeChain);if(!o)throw new Error("No address found to swap the tokens from.");const r=!O.toToken?.address||!O.toToken?.decimals,n=!O.sourceToken?.address||!O.sourceToken?.decimals||!v.S.bigNumber(O.sourceTokenAmount).gt(0),s=!O.sourceTokenAmount;return{networkAddress:i,fromAddress:o,fromCaipAddress:t,sourceTokenAddress:O.sourceToken?.address,toTokenAddress:O.toToken?.address,toTokenAmount:O.toTokenAmount,toTokenDecimals:O.toToken?.decimals,sourceTokenAmount:O.sourceTokenAmount,sourceTokenDecimals:O.sourceToken?.decimals,invalidToToken:r,invalidSourceToken:n,invalidSourceTokenAmount:s,availableToSwap:t&&!r&&!n&&!s,isAuthConnector:a===b.o.CONNECTOR_ID.AUTH}},async setSourceToken(e){if(!e)return O.sourceToken=e,O.sourceTokenAmount="",void(O.sourceTokenPriceInUSD=0);O.sourceToken=e,await q.setTokenPrice(e.address,"sourceToken")},setSourceTokenAmount(e){O.sourceTokenAmount=e},async setToToken(e){if(!e)return O.toToken=e,O.toTokenAmount="",void(O.toTokenPriceInUSD=0);O.toToken=e,await q.setTokenPrice(e.address,"toToken")},setToTokenAmount(e){O.toTokenAmount=e?v.S.toFixed(e,6):""},async setTokenPrice(e,t){let o=O.tokensPriceMap[e]||0;o||(O.loadingPrices=!0,o=await q.getAddressPrice(e)),"sourceToken"===t?O.sourceTokenPriceInUSD=o:"toToken"===t&&(O.toTokenPriceInUSD=o),O.loadingPrices&&(O.loadingPrices=!1),q.getParams().availableToSwap&&!O.switchingTokens&&q.swapTokens()},async switchTokens(){if(!O.initializing&&O.initialized&&!O.switchingTokens){O.switchingTokens=!0;try{const e=O.toToken?{...O.toToken}:void 0,t=O.sourceToken?{...O.sourceToken}:void 0,o=e&&""===O.toTokenAmount?"1":O.toTokenAmount;q.setSourceTokenAmount(o),q.setToTokenAmount(""),await q.setSourceToken(e),await q.setToToken(t),O.switchingTokens=!1,q.swapTokens()}catch(e){throw O.switchingTokens=!1,e}}},resetState(){O.myTokensWithBalance=N.myTokensWithBalance,O.tokensPriceMap=N.tokensPriceMap,O.initialized=N.initialized,O.initializing=N.initializing,O.switchingTokens=N.switchingTokens,O.sourceToken=N.sourceToken,O.sourceTokenAmount=N.sourceTokenAmount,O.sourceTokenPriceInUSD=N.sourceTokenPriceInUSD,O.toToken=N.toToken,O.toTokenAmount=N.toTokenAmount,O.toTokenPriceInUSD=N.toTokenPriceInUSD,O.networkPrice=N.networkPrice,O.networkTokenSymbol=N.networkTokenSymbol,O.networkBalanceInUSD=N.networkBalanceInUSD,O.inputError=N.inputError},resetValues(){const{networkAddress:e}=q.getParams(),t=O.tokens?.find(t=>t.address===e);q.setSourceToken(t),q.setToToken(void 0)},getApprovalLoadingState:()=>O.loadingApprovalTransaction,clearError(){O.transactionError=void 0},async initializeState(){if(!O.initializing){if(O.initializing=!0,!O.initialized)try{await q.fetchTokens(),O.initialized=!0}catch(e){O.initialized=!1,g.P.showError("Failed to initialize swap"),u.I.goBack()}O.initializing=!1}},async fetchTokens(){const{networkAddress:e}=q.getParams();await q.getNetworkTokenPrice(),await q.getMyTokensWithBalance();const t=O.myTokensWithBalance?.find(t=>t.address===e);t&&(O.networkTokenSymbol=t.symbol,q.setSourceToken(t),q.setSourceTokenAmount("0"))},async getTokenList(){const e=c.W.state.activeCaipNetwork?.caipNetworkId;if(O.caipNetworkId!==e||!O.tokens)try{O.tokensLoading=!0;const t=await C.s.getTokenList(e);O.tokens=t,O.caipNetworkId=e,O.popularTokens=t.sort((e,t)=>e.symbol<t.symbol?-1:e.symbol>t.symbol?1:0);const o=(e&&S.oU.SUGGESTED_TOKENS_BY_CHAIN?.[e]||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>Boolean(e)),i=(S.oU.SWAP_SUGGESTED_TOKENS||[]).map(e=>t.find(t=>t.symbol===e)).filter(e=>Boolean(e)).filter(e=>!o.some(t=>t.address===e.address));O.suggestedTokens=[...o,...i]}catch(e){O.tokens=[],O.popularTokens=[],O.suggestedTokens=[]}finally{O.tokensLoading=!1}},async getAddressPrice(e){const t=O.tokensPriceMap[e];if(t)return t;const o=await W.T.fetchTokenPrice({addresses:[e]}),i=o?.fungibles||[],a=[...O.tokens||[],...O.myTokensWithBalance||[]],r=a?.find(t=>t.address===e)?.symbol,n=i.find(e=>e.symbol.toLowerCase()===r?.toLowerCase())?.price||0,s=parseFloat(n.toString());return O.tokensPriceMap[e]=s,s},async getNetworkTokenPrice(){const{networkAddress:e}=q.getParams(),t=await W.T.fetchTokenPrice({addresses:[e]}).catch(()=>(g.P.showError("Failed to fetch network token price"),{fungibles:[]})),o=t.fungibles?.[0],i=o?.price.toString()||"0";O.tokensPriceMap[e]=parseFloat(i),O.networkTokenSymbol=o?.symbol||"",O.networkPrice=i},async getMyTokensWithBalance(e){const t=await x.Z.getMyTokensWithBalance(e),o=C.s.mapBalancesToSwapTokens(t);o&&(await q.getInitialGasPrice(),q.setBalances(o))},setBalances(e){const{networkAddress:t}=q.getParams(),o=c.W.state.activeCaipNetwork;if(!o)return;const i=e.find(e=>e.address===t);e.forEach(e=>{O.tokensPriceMap[e.address]=e.price||0}),O.myTokensWithBalance=e.filter(e=>e.address.startsWith(o.caipNetworkId)),O.networkBalanceInUSD=i?v.S.multiply(i.quantity.numeric,i.price).toString():"0"},async getInitialGasPrice(){const e=await C.s.fetchGasPrice();if(!e)return{gasPrice:null,gasPriceInUSD:null};switch(c.W.state?.activeCaipNetwork?.chainNamespace){case b.o.CHAIN.SOLANA:return O.gasFee=e.standard??"0",O.gasPriceInUSD=v.S.multiply(e.standard,O.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(O.gasFee),gasPriceInUSD:Number(O.gasPriceInUSD)};case b.o.CHAIN.EVM:default:const t=e.standard??"0",o=BigInt(t),i=BigInt(R),a=P.getGasPriceInUSD(O.networkPrice,i,o);return O.gasFee=t,O.gasPriceInUSD=a,{gasPrice:o,gasPriceInUSD:a}}},async swapTokens(){const e=c.W.getAccountData()?.address,t=O.sourceToken,o=O.toToken,i=v.S.bigNumber(O.sourceTokenAmount).gt(0);if(i||q.setToTokenAmount(""),!o||!t||O.loadingPrices||!i||!e)return;O.loadingQuote=!0;const a=v.S.bigNumber(O.sourceTokenAmount).times(10**t.decimals).round(0);try{const i=await W.T.fetchSwapQuote({userAddress:e,from:t.address,to:o.address,gasPrice:O.gasFee,amount:a.toString()});O.loadingQuote=!1;const r=i?.quotes?.[0]?.toAmount;if(!r)return void I.h.open({displayMessage:"Incorrect amount",debugMessage:"Please enter a valid amount"},"error");const n=v.S.bigNumber(r).div(10**o.decimals).toString();q.setToTokenAmount(n),q.hasInsufficientToken(O.sourceTokenAmount,t.address)?O.inputError="Insufficient balance":(O.inputError=void 0,q.setTransactionDetails())}catch(e){const t=await C.s.handleSwapError(e);O.loadingQuote=!1,O.inputError=t||"Insufficient balance"}},async getTransaction(){const{fromCaipAddress:e,availableToSwap:t}=q.getParams(),o=O.sourceToken,i=O.toToken;if(e&&t&&o&&i&&!O.loadingQuote)try{let t;return O.loadingBuildTransaction=!0,t=await C.s.fetchSwapAllowance({userAddress:e,tokenAddress:o.address,sourceTokenAmount:O.sourceTokenAmount,sourceTokenDecimals:o.decimals})?await q.createSwapTransaction():await q.createAllowanceTransaction(),O.loadingBuildTransaction=!1,O.fetchError=!1,t}catch(e){return u.I.goBack(),g.P.showError("Failed to check allowance"),O.loadingBuildTransaction=!1,O.approvalTransaction=void 0,O.swapTransaction=void 0,void(O.fetchError=!0)}},async createAllowanceTransaction(){const{fromCaipAddress:e,sourceTokenAddress:t,toTokenAddress:o}=q.getParams();if(e&&o){if(!t)throw new Error("createAllowanceTransaction - No source token address found.");try{const i=await W.T.generateApproveCalldata({from:t,to:o,userAddress:e}),a=A.w.getPlainAddress(i.tx.from);if(!a)throw new Error("SwapController:createAllowanceTransaction - address is required");const r={data:i.tx.data,to:a,gasPrice:BigInt(i.tx.eip155.gasPrice),value:BigInt(i.tx.value),toAmount:O.toTokenAmount};return O.swapTransaction=void 0,O.approvalTransaction={data:r.data,to:r.to,gasPrice:r.gasPrice,value:r.value,toAmount:r.toAmount},{data:r.data,to:r.to,gasPrice:r.gasPrice,value:r.value,toAmount:r.toAmount}}catch(e){return u.I.goBack(),g.P.showError("Failed to create approval transaction"),O.approvalTransaction=void 0,O.swapTransaction=void 0,void(O.fetchError=!0)}}},async createSwapTransaction(){const{networkAddress:e,fromCaipAddress:t,sourceTokenAmount:o}=q.getParams(),i=O.sourceToken,a=O.toToken;if(!(t&&o&&i&&a))return;const r=p.x.parseUnits(o,i.decimals)?.toString();try{const o=await W.T.generateSwapCalldata({userAddress:t,from:i.address,to:a.address,amount:r,disableEstimate:!0}),n=i.address===e,s=BigInt(o.tx.eip155.gas),c=BigInt(o.tx.eip155.gasPrice),l=A.w.getPlainAddress(o.tx.to);if(!l)throw new Error("SwapController:createSwapTransaction - address is required");const d={data:o.tx.data,to:l,gas:s,gasPrice:c,value:n?BigInt(r??"0"):BigInt("0"),toAmount:O.toTokenAmount};return O.gasPriceInUSD=P.getGasPriceInUSD(O.networkPrice,s,c),O.approvalTransaction=void 0,O.swapTransaction=d,d}catch(e){return u.I.goBack(),g.P.showError("Failed to create transaction"),O.approvalTransaction=void 0,O.swapTransaction=void 0,void(O.fetchError=!0)}},onEmbeddedWalletApprovalSuccess(){g.P.showLoading("Approve limit increase in your wallet"),u.I.replace("SwapPreview")},async sendTransactionForApproval(e){const{fromAddress:t,isAuthConnector:o}=q.getParams();O.loadingApprovalTransaction=!0,o?u.I.pushTransactionStack({onSuccess:q.onEmbeddedWalletApprovalSuccess}):g.P.showLoading("Approve limit increase in your wallet");try{await p.x.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:b.o.CHAIN.EVM}),await q.swapTokens(),await q.getTransaction(),O.approvalTransaction=void 0,O.loadingApprovalTransaction=!1}catch(e){const t=e;O.transactionError=t?.displayMessage,O.loadingApprovalTransaction=!1,g.P.showError(t?.displayMessage||"Transaction error"),E.E.sendEvent({type:"track",event:"SWAP_APPROVAL_ERROR",properties:{message:t?.displayMessage||t?.message||"Unknown",network:c.W.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:q.state.sourceToken?.symbol||"",swapToToken:q.state.toToken?.symbol||"",swapFromAmount:q.state.sourceTokenAmount||"",swapToAmount:q.state.toTokenAmount||"",isSmartAccount:(0,T.lj)(b.o.CHAIN.EVM)===k.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(e){if(!e)return;const{fromAddress:t,toTokenAmount:o,isAuthConnector:i}=q.getParams();O.loadingTransaction=!0;const a=`Swapping ${O.sourceToken?.symbol} to ${v.S.formatNumberToLocalString(o,3)} ${O.toToken?.symbol}`,r=`Swapped ${O.sourceToken?.symbol} to ${v.S.formatNumberToLocalString(o,3)} ${O.toToken?.symbol}`;i?u.I.pushTransactionStack({onSuccess(){u.I.replace("Account"),g.P.showLoading(a),D.resetState()}}):g.P.showLoading("Confirm transaction in your wallet");try{const o=[O.sourceToken?.address,O.toToken?.address].join(","),a=await p.x.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:b.o.CHAIN.EVM});return O.loadingTransaction=!1,g.P.showSuccess(r),E.E.sendEvent({type:"track",event:"SWAP_SUCCESS",properties:{network:c.W.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:q.state.sourceToken?.symbol||"",swapToToken:q.state.toToken?.symbol||"",swapFromAmount:q.state.sourceTokenAmount||"",swapToAmount:q.state.toTokenAmount||"",isSmartAccount:(0,T.lj)(b.o.CHAIN.EVM)===k.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}}),D.resetState(),i||u.I.replace("Account"),D.getMyTokensWithBalance(o),a}catch(e){const t=e;return O.transactionError=t?.displayMessage,O.loadingTransaction=!1,g.P.showError(t?.displayMessage||"Transaction error"),void E.E.sendEvent({type:"track",event:"SWAP_ERROR",properties:{message:t?.displayMessage||t?.message||"Unknown",network:c.W.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:q.state.sourceToken?.symbol||"",swapToToken:q.state.toToken?.symbol||"",swapFromAmount:q.state.sourceTokenAmount||"",swapToAmount:q.state.toTokenAmount||"",isSmartAccount:(0,T.lj)(b.o.CHAIN.EVM)===k.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}})}},hasInsufficientToken:(e,t)=>P.isInsufficientSourceTokenForSwap(e,t,O.myTokensWithBalance),setTransactionDetails(){const{toTokenAddress:e,toTokenDecimals:t}=q.getParams();e&&t&&(O.gasPriceInUSD=P.getGasPriceInUSD(O.networkPrice,BigInt(O.gasFee),BigInt(R)),O.priceImpact=P.getPriceImpact({sourceTokenAmount:O.sourceTokenAmount,sourceTokenPriceInUSD:O.sourceTokenPriceInUSD,toTokenPriceInUSD:O.toTokenPriceInUSD,toTokenAmount:O.toTokenAmount}),O.maxSlippage=P.getMaxSlippage(O.slippage,O.toTokenAmount),O.providerFee=P.getProviderFee(O.sourceTokenAmount))}},q=(0,$.X)(D);var z=o(52855),B=o(26109),F=o(43494),M=o(67569);const U=M.AH`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius:e})=>e[8]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    overflow: hidden;
  }
`;let H=class extends i.WF{render(){return i.qy`<slot></slot>`}};H.styles=[B.W5,U],H=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n}([(0,F.E)("wui-card")],H),o(60310),o(97632),o(72081),o(69807);const j=M.AH`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[6]};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens:e})=>e.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundWarning};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundError};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:e})=>e[2]};
    background-color: var(--local-icon-bg-value);
  }
`;var L=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};const V={info:"info",success:"checkmark",warning:"warningCircle",error:"warning"};let Z=class extends i.WF{constructor(){super(...arguments),this.message="",this.type="info"}render(){return i.qy`
      <wui-flex
        data-type=${(0,r.J)(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${V[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){I.h.close()}};Z.styles=[B.W5,j],L([(0,a.MZ)()],Z.prototype,"message",void 0),L([(0,a.MZ)()],Z.prototype,"type",void 0),Z=L([(0,F.E)("wui-alertbar")],Z);const _=z.AH`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing:e})=>e[3]};
    left: ${({spacing:e})=>e[4]};
    right: ${({spacing:e})=>e[4]};
    opacity: 0;
    pointer-events: none;
  }
`;var K=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};const G={info:{backgroundColor:"fg-350",iconColor:"fg-325",icon:"info"},success:{backgroundColor:"success-glass-reown-020",iconColor:"success-125",icon:"checkmark"},warning:{backgroundColor:"warning-glass-reown-020",iconColor:"warning-100",icon:"warningCircle"},error:{backgroundColor:"error-glass-reown-020",iconColor:"error-125",icon:"warning"}};let Y=class extends i.WF{constructor(){super(),this.unsubscribe=[],this.open=I.h.state.open,this.onOpen(!0),this.unsubscribe.push(I.h.subscribeKey("open",e=>{this.open=e,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{message:e,variant:t}=I.h.state,o=G[t];return i.qy`
      <wui-alertbar
        message=${e}
        backgroundColor=${o?.backgroundColor}
        iconColor=${o?.iconColor}
        icon=${o?.icon}
        type=${t}
      ></wui-alertbar>
    `}onOpen(e){this.open?(this.animate([{opacity:0,transform:"scale(0.85)"},{opacity:1,transform:"scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: auto"):e||(this.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: none")}};Y.styles=_,K([(0,a.wk)()],Y.prototype,"open",void 0),Y=K([(0,z.EM)("w3m-alertbar")],Y);var X=o(27601),J=o(73337);const Q=M.AH`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var ee=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};let te=class extends i.WF{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return i.qy`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${(0,r.J)(this.iconSize)}></wui-icon>
    </button>`}};te.styles=[B.W5,B.fD,Q],ee([(0,a.MZ)()],te.prototype,"icon",void 0),ee([(0,a.MZ)()],te.prototype,"variant",void 0),ee([(0,a.MZ)()],te.prototype,"type",void 0),ee([(0,a.MZ)()],te.prototype,"size",void 0),ee([(0,a.MZ)()],te.prototype,"iconSize",void 0),ee([(0,a.MZ)({type:Boolean})],te.prototype,"fullWidth",void 0),ee([(0,a.MZ)({type:Boolean})],te.prototype,"disabled",void 0),te=ee([(0,F.E)("wui-icon-button")],te),o(36887);const oe=M.AH`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
    border-radius: ${({borderRadius:e})=>e[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing:e})=>e[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    opacity: 0.5;
  }
`;var ie=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};const ae={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},re={lg:"lg",md:"md",sm:"sm"};let ne=class extends i.WF{constructor(){super(...arguments),this.imageSrc="",this.text="",this.size="lg",this.type="text-dropdown",this.disabled=!1}render(){return i.qy`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){const e=ae[this.size];return this.text?i.qy`<wui-text color="primary" variant=${e}>${this.text}</wui-text>`:null}imageTemplate(){if(this.imageSrc)return i.qy`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;const e=re[this.size];return i.qy` <wui-flex class="left-icon-container">
      <wui-icon size=${e} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};ne.styles=[B.W5,B.fD,oe],ie([(0,a.MZ)()],ne.prototype,"imageSrc",void 0),ie([(0,a.MZ)()],ne.prototype,"text",void 0),ie([(0,a.MZ)()],ne.prototype,"size",void 0),ie([(0,a.MZ)()],ne.prototype,"type",void 0),ie([(0,a.MZ)({type:Boolean})],ne.prototype,"disabled",void 0),ne=ie([(0,F.E)("wui-select")],ne),o(5752),o(45090);var se=o(41482);const ce=z.AH`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: var(--local-header-background-color);
  }

  wui-text {
    background-color: var(--local-header-background-color);
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings:e})=>e["ease-out-power-2"]},
      slide-down-in 120ms forwards ${({easings:e})=>e["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings:e})=>e["ease-out-power-2"]},
      slide-up-in 120ms forwards ${({easings:e})=>e["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;var le=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};const de=["SmartSessionList"],ue={PayWithExchange:z.f.tokens.theme.foregroundPrimary};function pe(){const e=u.I.state.data?.connector?.name,t=u.I.state.data?.wallet?.name,o=u.I.state.data?.network?.name,i=t??e,a=l.a.getConnectors(),r=1===a.length&&"w3m-email"===a[0]?.id,n=c.W.getAccountData()?.socialProvider;return{Connect:`Connect ${r?"Email":""} Wallet`,Create:"Create Wallet",ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:"All Wallets",ApproveTransaction:"Approve Transaction",BuyInProgress:"Buy",UsageExceeded:"Usage Exceeded",ConnectingExternal:i??"Connect Wallet",ConnectingWalletConnect:i??"WalletConnect",ConnectingWalletConnectBasic:"WalletConnect",ConnectingSiwe:"Sign In",Convert:"Convert",ConvertSelectToken:"Select token",ConvertPreview:"Preview Convert",Downloads:i?`Get ${i}`:"Downloads",EmailLogin:"Email Login",EmailVerifyOtp:"Confirm Email",EmailVerifyDevice:"Register Device",GetWallet:"Get a Wallet",Networks:"Choose Network",OnRampProviders:"Choose Provider",OnRampActivity:"Activity",OnRampTokenSelect:"Select Token",OnRampFiatSelect:"Select Currency",Pay:"How you pay",ProfileWallets:"Wallets",SwitchNetwork:o??"Switch Network",Transactions:"Activity",UnsupportedChain:"Switch Network",UpgradeEmailWallet:"Upgrade Your Wallet",UpdateEmailWallet:"Edit Email",UpdateEmailPrimaryOtp:"Confirm Current Email",UpdateEmailSecondaryOtp:"Confirm New Email",WhatIsABuy:"What is Buy?",RegisterAccountName:"Choose Name",RegisterAccountNameSuccess:"",WalletReceive:"Receive",WalletCompatibleNetworks:"Compatible Networks",Swap:"Swap",SwapSelectToken:"Select Token",SwapPreview:"Preview Swap",WalletSend:"Send",WalletSendPreview:"Review Send",WalletSendSelectToken:"Select Token",WalletSendConfirmed:"Confirmed",WhatIsANetwork:"What is a network?",WhatIsAWallet:"What is a Wallet?",ConnectWallets:"Connect Wallet",ConnectSocials:"All Socials",ConnectingSocial:n?n.charAt(0).toUpperCase()+n.slice(1):"Connect Social",ConnectingMultiChain:"Select Chain",ConnectingFarcaster:"Farcaster",SwitchActiveChain:"Switch Chain",SmartSessionCreated:void 0,SmartSessionList:"Smart Sessions",SIWXSignMessage:"Sign In",PayLoading:"Payment in Progress",DataCapture:"Profile",DataCaptureOtpConfirm:"Confirm Email",FundWallet:"Fund Wallet",PayWithExchange:"Deposit from Exchange",PayWithExchangeSelectAsset:"Select Asset"}}let we=class extends i.WF{constructor(){super(),this.unsubscribe=[],this.heading=pe()[u.I.state.view],this.network=c.W.state.activeCaipNetwork,this.networkImage=X.$.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=u.I.state.view,this.viewDirection="",this.unsubscribe.push(J.j.subscribeNetworkImages(()=>{this.networkImage=X.$.getNetworkImage(this.network)}),u.I.subscribeKey("view",e=>{setTimeout(()=>{this.view=e,this.heading=pe()[e]},se.o.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),c.W.subscribeKey("activeCaipNetwork",e=>{this.network=e,this.networkImage=X.$.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){const e=ue[u.I.state.view]??z.f.tokens.theme.backgroundPrimary;return this.style.setProperty("--local-header-background-color",e),i.qy`
      <wui-flex
        .padding=${["0","4","0","4"]}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){E.E.sendEvent({type:"track",event:"CLICK_WALLET_HELP"}),u.I.push("WhatIsAWallet")}async onClose(){await h.safeClose()}rightHeaderTemplate(){const e=n.H?.state?.features?.smartSessions;return"Account"===u.I.state.view&&e?i.qy`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${()=>u.I.push("SmartSessionList")}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `:this.closeButtonTemplate()}closeButtonTemplate(){return i.qy`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        iconSize="lg"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){const e=de.includes(this.view);return i.qy`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text
          display="inline"
          variant="lg-regular"
          color="primary"
          data-testid="w3m-header-text"
        >
          ${this.heading}
        </wui-text>
        ${e?i.qy`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){const{view:e}=u.I.state,t="Connect"===e,o=n.H.state.enableEmbedded,a="ApproveTransaction"===e,s="ConnectingSiwe"===e,c="Account"===e,l=n.H.state.enableNetworkSwitch,d=a||s||t&&o;return c&&l?i.qy`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${(0,r.J)(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${(0,r.J)(this.networkImage)}
      ></wui-select>`:this.showBack&&!d?i.qy`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:i.qy`<wui-icon-button
      data-hidden=${!t}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      iconSize="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(E.E.sendEvent({type:"track",event:"CLICK_NETWORKS"}),u.I.push("Networks"))}isAllowedNetworkSwitch(){const e=c.W.getAllRequestedCaipNetworks(),t=!!e&&e.length>1,o=e?.find(({id:e})=>e===this.network?.id);return t||!o}onViewChange(){const{history:e}=u.I.state;let t=se.o.VIEW_DIRECTION.Next;e.length<this.prevHistoryLength&&(t=se.o.VIEW_DIRECTION.Prev),this.prevHistoryLength=e.length,this.viewDirection=t}async onHistoryChange(){const{history:e}=u.I.state,t=this.shadowRoot?.querySelector("#dynamic");e.length>1&&!this.showBack&&t?(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!0,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"})):e.length<=1&&this.showBack&&t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}onGoBack(){u.I.goBack()}};we.styles=ce,le([(0,a.wk)()],we.prototype,"heading",void 0),le([(0,a.wk)()],we.prototype,"network",void 0),le([(0,a.wk)()],we.prototype,"networkImage",void 0),le([(0,a.wk)()],we.prototype,"showBack",void 0),le([(0,a.wk)()],we.prototype,"prevHistoryLength",void 0),le([(0,a.wk)()],we.prototype,"view",void 0),le([(0,a.wk)()],we.prototype,"viewDirection",void 0),we=le([(0,z.EM)("w3m-header")],we),o(20880),o(12851);const he=M.AH`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[2]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens:e})=>e.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius:e})=>e.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing:e})=>e[1]};
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    border-radius: ${({borderRadius:e})=>e.round} !important;
  }
`;var me=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};let ge=class extends i.WF{constructor(){super(...arguments),this.message="",this.variant="success"}render(){return i.qy`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){return"loading"===this.variant?i.qy`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:i.qy`<wui-icon-box
      size="md"
      color=${{success:"success",error:"error",warning:"warning",info:"default"}[this.variant]}
      icon=${{success:"checkmark",error:"warning",warning:"warningCircle",info:"info"}[this.variant]}
    ></wui-icon-box>`}};ge.styles=[B.W5,he],me([(0,a.MZ)()],ge.prototype,"message",void 0),me([(0,a.MZ)()],ge.prototype,"variant",void 0),ge=me([(0,F.E)("wui-snackbar")],ge);const ye=i.AH`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`;var fe=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};let ve=class extends i.WF{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=g.P.state.open,this.unsubscribe.push(g.P.subscribeKey("open",e=>{this.open=e,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(e=>e())}render(){const{message:e,variant:t}=g.P.state;return i.qy` <wui-snackbar message=${e} variant=${t}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:"translateX(-50%) scale(0.85)"},{opacity:1,transform:"translateX(-50%) scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.timeout&&clearTimeout(this.timeout),g.P.state.autoClose&&(this.timeout=setTimeout(()=>g.P.hide(),2500))):this.animate([{opacity:1,transform:"translateX(-50%) scale(1)"},{opacity:0,transform:"translateX(-50%) scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"})}};ve.styles=ye,fe([(0,a.wk)()],ve.prototype,"open",void 0),ve=fe([(0,z.EM)("w3m-snackbar")],ve);const be=(0,y.BX)({message:"",open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:"shade"}),ke={state:be,subscribe:e=>(0,y.B1)(be,()=>e(be)),subscribeKey:(e,t)=>(0,f.u$)(be,e,t),showTooltip({message:e,triggerRect:t,variant:o}){be.open=!0,be.message=e,be.triggerRect=t,be.variant=o},hide(){be.open=!1,be.message="",be.triggerRect={width:0,height:0,top:0,left:0}}},xe=(0,$.X)(ke);o(51636);const Te=z.AH`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px ${({spacing:e})=>e[3]} 10px ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.backgroundPrimary};
    position: absolute;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - ${({spacing:e})=>e[5]});
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.textPrimary};
    border: none;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var Se=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};let Ae=class extends i.WF{constructor(){super(),this.unsubscribe=[],this.open=xe.state.open,this.message=xe.state.message,this.triggerRect=xe.state.triggerRect,this.variant=xe.state.variant,this.unsubscribe.push(xe.subscribe(e=>{this.open=e.open,this.message=e.message,this.triggerRect=e.triggerRect,this.variant=e.variant}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){this.dataset.variant=this.variant;const e=this.triggerRect.top,t=this.triggerRect.left;return this.style.cssText=`\n    --w3m-tooltip-top: ${e}px;\n    --w3m-tooltip-left: ${t}px;\n    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;\n    --w3m-tooltip-display: ${this.open?"flex":"none"};\n    --w3m-tooltip-opacity: ${this.open?1:0};\n    `,i.qy`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};Ae.styles=[Te],Se([(0,a.wk)()],Ae.prototype,"open",void 0),Se([(0,a.wk)()],Ae.prototype,"message",void 0),Se([(0,a.wk)()],Ae.prototype,"triggerRect",void 0),Se([(0,a.wk)()],Ae.prototype,"variant",void 0),Ae=Se([(0,z.EM)("w3m-tooltip")],Ae);const Ce={getTabsByNamespace:e=>Boolean(e)&&e===b.o.CHAIN.EVM?!1===n.H.state.remoteFeatures?.activity?se.o.ACCOUNT_TABS.filter(e=>"Activity"!==e.label):se.o.ACCOUNT_TABS:[],isValidReownName:e=>/^[a-zA-Z0-9]+$/gu.test(e),isValidEmail:e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(e),validateReownName:e=>e.replace(/\^/gu,"").toLowerCase().replace(/[^a-zA-Z0-9]/gu,""),hasFooter(){const e=u.I.state.view;if(se.o.VIEWS_WITH_LEGAL_FOOTER.includes(e)){const{termsConditionsUrl:e,privacyPolicyUrl:t}=n.H.state,o=n.H.state.features?.legalCheckbox;return!(!e&&!t||o)}return se.o.VIEWS_WITH_DEFAULT_FOOTER.includes(e)}};o(99530);const Pe=z.AH`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing:e})=>e[3]};
  }

  a {
    text-decoration: none;
    color: ${({tokens:e})=>e.core.textAccentPrimary};
    font-weight: 500;
  }
`;var $e=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};let Ie=class extends i.WF{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=n.H.state.remoteFeatures,this.unsubscribe.push(n.H.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){const{termsConditionsUrl:e,privacyPolicyUrl:t}=n.H.state,o=n.H.state.features?.legalCheckbox;return!e&&!t||o?i.qy`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `:i.qy`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${["4","3","3","3"]} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}andTemplate(){const{termsConditionsUrl:e,privacyPolicyUrl:t}=n.H.state;return e&&t?"and":""}termsTemplate(){const{termsConditionsUrl:e}=n.H.state;return e?i.qy`<a href=${e} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){const{privacyPolicyUrl:e}=n.H.state;return e?i.qy`<a href=${e} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(e=!1){return this.remoteFeatures?.reownBranding?e?i.qy`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:i.qy`<wui-ux-by-reown></wui-ux-by-reown>`:null}};Ie.styles=[Pe],$e([(0,a.wk)()],Ie.prototype,"remoteFeatures",void 0),Ie=$e([(0,z.EM)("w3m-legal-footer")],Ie),o(45101);const We=i.AH``;let Ee=class extends i.WF{render(){const{termsConditionsUrl:e,privacyPolicyUrl:t}=n.H.state;return e||t?i.qy`
      <wui-flex
        .padding=${["4","3","3","3"]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `:null}howDoesItWorkTemplate(){return i.qy` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){E.E.sendEvent({type:"track",event:"SELECT_WHAT_IS_A_BUY",properties:{isSmartAccount:(0,T.lj)(c.W.state.activeChain)===k.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}}),u.I.push("WhatIsABuy")}};Ee.styles=[We],Ee=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n}([(0,z.EM)("w3m-onramp-providers-footer")],Ee);const Re=z.AH`
  :host {
    display: block;
  }

  div.container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    height: auto;
    display: block;
  }

  div.container[status='hide'] {
    animation: fade-out;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: 0s;
  }

  div.container[status='show'] {
    animation: fade-in;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(6px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
      filter: blur(0px);
    }
    to {
      opacity: 0;
      filter: blur(6px);
    }
  }
`;var Ne=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};let Oe=class extends i.WF{constructor(){super(...arguments),this.resizeObserver=void 0,this.unsubscribe=[],this.status="hide",this.view=u.I.state.view}firstUpdated(){this.status=Ce.hasFooter()?"show":"hide",this.unsubscribe.push(u.I.subscribeKey("view",e=>{this.view=e,this.status=Ce.hasFooter()?"show":"hide","hide"===this.status&&document.documentElement.style.setProperty("--apkt-footer-height","0px")})),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)if(t.target===this.getWrapper()){const e=`${t.contentRect.height}px`;document.documentElement.style.setProperty("--apkt-footer-height",e)}}),this.resizeObserver.observe(this.getWrapper())}render(){return i.qy`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `}templatePageContainer(){return Ce.hasFooter()?i.qy` ${this.templateFooter()}`:null}templateFooter(){switch(this.view){case"Networks":return this.templateNetworksFooter();case"Connect":case"ConnectWallets":case"OnRampFiatSelect":case"OnRampTokenSelect":return i.qy`<w3m-legal-footer></w3m-legal-footer>`;case"OnRampProviders":return i.qy`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;default:return null}}templateNetworksFooter(){return i.qy` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`}onNetworkHelp(){E.E.sendEvent({type:"track",event:"CLICK_NETWORK_HELP"}),u.I.push("WhatIsANetwork")}getWrapper(){return this.shadowRoot?.querySelector("div.container")}};Oe.styles=[Re],Ne([(0,a.wk)()],Oe.prototype,"status",void 0),Ne([(0,a.wk)()],Oe.prototype,"view",void 0),Oe=Ne([(0,z.EM)("w3m-footer")],Oe);const De=z.AH`
  :host {
    display: block;
    width: inherit;
  }
`;var qe=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};let ze=class extends i.WF{constructor(){super(),this.unsubscribe=[],this.viewState=u.I.state.view,this.history=u.I.state.history.join(","),this.unsubscribe.push(u.I.subscribeKey("view",()=>{this.history=u.I.state.history.join(","),document.documentElement.style.setProperty("--apkt-duration-dynamic","var(--apkt-durations-lg)")}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),document.documentElement.style.setProperty("--apkt-duration-dynamic","0s")}render(){return i.qy`${this.templatePageContainer()}`}templatePageContainer(){return i.qy`<w3m-router-container
      history=${this.history}
      .setView=${()=>{this.viewState=u.I.state.view}}
    >
      ${this.viewTemplate(this.viewState)}
    </w3m-router-container>`}viewTemplate(e){switch(e){case"AccountSettings":return i.qy`<w3m-account-settings-view></w3m-account-settings-view>`;case"Account":return i.qy`<w3m-account-view></w3m-account-view>`;case"AllWallets":return i.qy`<w3m-all-wallets-view></w3m-all-wallets-view>`;case"ApproveTransaction":return i.qy`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case"BuyInProgress":return i.qy`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case"ChooseAccountName":return i.qy`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case"Connect":default:return i.qy`<w3m-connect-view></w3m-connect-view>`;case"Create":return i.qy`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case"ConnectingWalletConnect":return i.qy`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case"ConnectingWalletConnectBasic":return i.qy`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case"ConnectingExternal":return i.qy`<w3m-connecting-external-view></w3m-connecting-external-view>`;case"ConnectingSiwe":return i.qy`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case"ConnectWallets":return i.qy`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case"ConnectSocials":return i.qy`<w3m-connect-socials-view></w3m-connect-socials-view>`;case"ConnectingSocial":return i.qy`<w3m-connecting-social-view></w3m-connecting-social-view>`;case"DataCapture":return i.qy`<w3m-data-capture-view></w3m-data-capture-view>`;case"DataCaptureOtpConfirm":return i.qy`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`;case"Downloads":return i.qy`<w3m-downloads-view></w3m-downloads-view>`;case"EmailLogin":return i.qy`<w3m-email-login-view></w3m-email-login-view>`;case"EmailVerifyOtp":return i.qy`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case"EmailVerifyDevice":return i.qy`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case"GetWallet":return i.qy`<w3m-get-wallet-view></w3m-get-wallet-view>`;case"Networks":return i.qy`<w3m-networks-view></w3m-networks-view>`;case"SwitchNetwork":return i.qy`<w3m-network-switch-view></w3m-network-switch-view>`;case"ProfileWallets":return i.qy`<w3m-profile-wallets-view></w3m-profile-wallets-view>`;case"Transactions":return i.qy`<w3m-transactions-view></w3m-transactions-view>`;case"OnRampProviders":return i.qy`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case"OnRampTokenSelect":return i.qy`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case"OnRampFiatSelect":return i.qy`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case"UpgradeEmailWallet":return i.qy`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case"UpdateEmailWallet":return i.qy`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case"UpdateEmailPrimaryOtp":return i.qy`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case"UpdateEmailSecondaryOtp":return i.qy`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case"UnsupportedChain":return i.qy`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case"Swap":return i.qy`<w3m-swap-view></w3m-swap-view>`;case"SwapSelectToken":return i.qy`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case"SwapPreview":return i.qy`<w3m-swap-preview-view></w3m-swap-preview-view>`;case"WalletSend":return i.qy`<w3m-wallet-send-view></w3m-wallet-send-view>`;case"WalletSendSelectToken":return i.qy`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case"WalletSendPreview":return i.qy`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case"WalletSendConfirmed":return i.qy`<w3m-send-confirmed-view></w3m-send-confirmed-view>`;case"WhatIsABuy":return i.qy`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case"WalletReceive":return i.qy`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case"WalletCompatibleNetworks":return i.qy`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case"WhatIsAWallet":return i.qy`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case"ConnectingMultiChain":return i.qy`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case"WhatIsANetwork":return i.qy`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case"ConnectingFarcaster":return i.qy`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case"SwitchActiveChain":return i.qy`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case"RegisterAccountName":return i.qy`<w3m-register-account-name-view></w3m-register-account-name-view>`;case"RegisterAccountNameSuccess":return i.qy`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case"SmartSessionCreated":return i.qy`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case"SmartSessionList":return i.qy`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case"SIWXSignMessage":return i.qy`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case"Pay":return i.qy`<w3m-pay-view></w3m-pay-view>`;case"PayLoading":return i.qy`<w3m-pay-loading-view></w3m-pay-loading-view>`;case"FundWallet":return i.qy`<w3m-fund-wallet-view></w3m-fund-wallet-view>`;case"PayWithExchange":return i.qy`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`;case"PayWithExchangeSelectAsset":return i.qy`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`;case"UsageExceeded":return i.qy`<w3m-usage-exceeded-view></w3m-usage-exceeded-view>`}}};ze.styles=[De],qe([(0,a.wk)()],ze.prototype,"viewState",void 0),qe([(0,a.wk)()],ze.prototype,"history",void 0),ze=qe([(0,z.EM)("w3m-router")],ze);const Be=z.AH`
  :host {
    z-index: ${({tokens:e})=>e.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens:e})=>e.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      backdrop-filter ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    padding: var(--local-modal-padding);
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    transition-delay: ${({durations:e})=>e.md};
    will-change: box-shadow;
  }

  :host([data-mobile-fullscreen='true']) wui-card::before {
    border-radius: 0px;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:e})=>e.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      w3m-shake ${({durations:e})=>e.xl}
        ${({easings:e})=>e["ease-out-power-2"]};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    :host([data-mobile-fullscreen='true']) {
      height: 100dvh;
    }
    :host([data-mobile-fullscreen='true']) wui-flex {
      align-items: stretch;
    }
    :host([data-mobile-fullscreen='true']) wui-card {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    :host(:not([data-mobile-fullscreen='true'])) wui-flex {
      align-items: flex-end;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card {
      max-width: 100%;
      border-bottom: none;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card[data-embedded='true'] {
      border-bottom-left-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
      border-bottom-right-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card:not([data-embedded='true']) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings:e})=>e["ease-out-power-2"]};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
  }
`;var Fe=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};const Me="scroll-lock",Ue={PayWithExchange:"0",PayWithExchangeSelectAsset:"0"};class He extends i.WF{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=n.H.state.enableEmbedded,this.open=s.W.state.open,this.caipAddress=c.W.state.activeCaipAddress,this.caipNetwork=c.W.state.activeCaipNetwork,this.shake=s.W.state.shake,this.filterByNamespace=l.a.state.filterByNamespace,this.padding=z.f.spacing[1],this.mobileFullScreen=n.H.state.enableMobileFullScreen,this.initializeTheming(),d.N.prefetchAnalyticsConfig(),this.unsubscribe.push(s.W.subscribeKey("open",e=>e?this.onOpen():this.onClose()),s.W.subscribeKey("shake",e=>this.shake=e),c.W.subscribeKey("activeCaipNetwork",e=>this.onNewNetwork(e)),c.W.subscribeKey("activeCaipAddress",e=>this.onNewAddress(e)),n.H.subscribeKey("enableEmbedded",e=>this.enableEmbedded=e),l.a.subscribeKey("filterByNamespace",e=>{this.filterByNamespace===e||c.W.getAccountData(e)?.caipAddress||(d.N.fetchRecommendedWallets(),this.filterByNamespace=e)}),u.I.subscribeKey("view",()=>{this.dataset.border=Ce.hasFooter()?"true":"false",this.padding=Ue[u.I.state.view]??z.f.spacing[1]}))}firstUpdated(){if(this.dataset.border=Ce.hasFooter()?"true":"false",this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.caipAddress){if(this.enableEmbedded)return s.W.close(),void this.prefetch();this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.style.setProperty("--local-modal-padding",this.padding),this.enableEmbedded?i.qy`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?i.qy`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return i.qy` <wui-card
      shake="${this.shake}"
      data-embedded="${(0,r.J)(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){if(e.target===e.currentTarget){if(this.mobileFullScreen)return;await this.handleClose()}}async handleClose(){await h.safeClose()}initializeTheming(){const{themeVariables:e,themeMode:t}=m.W.state,o=z.Zv.getColorTheme(t);(0,z.RF)(e,o)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),g.P.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const e=document.createElement("style");e.dataset.w3m=Me,e.textContent="\n      body {\n        touch-action: none;\n        overflow: hidden;\n        overscroll-behavior: contain;\n      }\n      w3m-modal {\n        pointer-events: auto;\n      }\n    ",document.head.appendChild(e)}onScrollUnlock(){const e=document.head.querySelector(`style[data-w3m="${Me}"]`);e&&e.remove()}onAddKeyboardListener(){this.abortController=new AbortController;const e=this.shadowRoot?.querySelector("wui-card");e?.focus(),window.addEventListener("keydown",t=>{if("Escape"===t.key)this.handleClose();else if("Tab"===t.key){const{tagName:o}=t.target;!o||o.includes("W3M-")||o.includes("WUI-")||e?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(e){const t=c.W.state.isSwitchingNamespace,o="ProfileWallets"===u.I.state.view;!e&&!t&&!o&&s.W.close(),await w.U.initializeIfEnabled(e),this.caipAddress=e,c.W.setIsSwitchingNamespace(!1)}onNewNetwork(e){const t=this.caipNetwork,o=t?.caipNetworkId?.toString(),i=e?.caipNetworkId?.toString(),a=o!==i,r="UnsupportedChain"===u.I.state.view,n=s.W.state.open;let c=!1;this.enableEmbedded&&"SwitchNetwork"===u.I.state.view&&(c=!0),a&&q.resetState(),n&&r&&(c=!0),c&&"SIWXSignMessage"!==u.I.state.view&&u.I.goBack(),this.caipNetwork=e}prefetch(){this.hasPrefetched||(d.N.prefetch(),d.N.fetchWalletsByPage({page:1}),this.hasPrefetched=!0)}}He.styles=Be,Fe([(0,a.MZ)({type:Boolean})],He.prototype,"enableEmbedded",void 0),Fe([(0,a.wk)()],He.prototype,"open",void 0),Fe([(0,a.wk)()],He.prototype,"caipAddress",void 0),Fe([(0,a.wk)()],He.prototype,"caipNetwork",void 0),Fe([(0,a.wk)()],He.prototype,"shake",void 0),Fe([(0,a.wk)()],He.prototype,"filterByNamespace",void 0),Fe([(0,a.wk)()],He.prototype,"padding",void 0),Fe([(0,a.wk)()],He.prototype,"mobileFullScreen",void 0);let je=class extends He{};je=Fe([(0,z.EM)("w3m-modal")],je);let Le=class extends He{};Le=Fe([(0,z.EM)("appkit-modal")],Le),o(58461);const Ve=z.AH`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: ${({borderRadius:e})=>e[5]};
    background-color: ${({colors:e})=>e.semanticError010};
  }
`;let Ze=class extends i.WF{constructor(){super()}render(){return i.qy`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${["1","3","4","3"]}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="error" name="warningCircle"></wui-icon>
        </wui-flex>

        <wui-text variant="lg-medium" color="primary" align="center">
          The app isn't responding as expected
        </wui-text>
        <wui-text variant="md-regular" color="secondary" align="center">
          Try again or reach out to the app team for help.
        </wui-text>

        <wui-button
          variant="neutral-secondary"
          size="md"
          @click=${this.onTryAgainClick.bind(this)}
          data-testid="w3m-usage-exceeded-button"
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try Again
        </wui-button>
      </wui-flex>
    `}onTryAgainClick(){u.I.goBack()}};Ze.styles=Ve,Ze=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n}([(0,z.EM)("w3m-usage-exceeded-view")],Ze),o(51479);const _e=z.AH`
  :host {
    width: 100%;
  }
`;var Ke=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};let Ge=class extends i.WF{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc="",this.name="",this.size="md",this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor="accent-100",this.rdnsId="",this.displayIndex=void 0,this.walletRank=void 0}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(e){super.updated(e),(e.has("name")||e.has("imageSrc")||e.has("walletRank"))&&(this.hasImpressionSent=!1),e.has("walletRank")&&this.walletRank&&!this.intersectionObserver&&this.setupIntersectionObserver()}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(e=>{e.forEach(e=>{!e.isIntersecting||this.loading||this.hasImpressionSent||this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=void 0)}sendImpressionEvent(){this.name&&!this.hasImpressionSent&&this.walletRank&&(this.hasImpressionSent=!0,(this.rdnsId||this.name)&&E.E.sendWalletImpressionEvent({name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:u.I.state.view,displayIndex:this.displayIndex}))}render(){return i.qy`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${(0,r.J)(this.imageSrc)}
        name=${this.name}
        size=${(0,r.J)(this.size)}
        tagLabel=${(0,r.J)(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
      ></wui-list-wallet>
    `}};Ge.styles=_e,Ke([(0,a.MZ)({type:Array})],Ge.prototype,"walletImages",void 0),Ke([(0,a.MZ)()],Ge.prototype,"imageSrc",void 0),Ke([(0,a.MZ)()],Ge.prototype,"name",void 0),Ke([(0,a.MZ)()],Ge.prototype,"size",void 0),Ke([(0,a.MZ)()],Ge.prototype,"tagLabel",void 0),Ke([(0,a.MZ)()],Ge.prototype,"tagVariant",void 0),Ke([(0,a.MZ)()],Ge.prototype,"walletIcon",void 0),Ke([(0,a.MZ)()],Ge.prototype,"tabIdx",void 0),Ke([(0,a.MZ)({type:Boolean})],Ge.prototype,"disabled",void 0),Ke([(0,a.MZ)({type:Boolean})],Ge.prototype,"showAllWallets",void 0),Ke([(0,a.MZ)({type:Boolean})],Ge.prototype,"loading",void 0),Ke([(0,a.MZ)({type:String})],Ge.prototype,"loadingSpinnerColor",void 0),Ke([(0,a.MZ)()],Ge.prototype,"rdnsId",void 0),Ke([(0,a.MZ)()],Ge.prototype,"displayIndex",void 0),Ke([(0,a.MZ)()],Ge.prototype,"walletRank",void 0),Ge=Ke([(0,z.EM)("w3m-list-wallet")],Ge);const Ye=z.AH`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations:e})=>e.lg};
    --local-transition: ${({easings:e})=>e["ease-out-power-2"]};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .container[data-mobile-fullscreen='true'] {
    overflow: scroll;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .page[data-mobile-fullscreen='true'] {
    height: 100%;
  }

  .page-content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`;var Xe=function(e,t,o,i){var a,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,o,n):a(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};let Je=class extends i.WF{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration="0.15s",this.transitionFunction="",this.history="",this.view="",this.setView=void 0,this.viewDirection="",this.historyState="",this.previousHeight="0px",this.mobileFullScreen=n.H.state.enableMobileFullScreen,this.onViewportResize=()=>{this.updateContainerHeight()}}updated(e){if(e.has("history")){const e=this.history;""!==this.historyState&&this.historyState!==e&&this.onViewChange(e)}e.has("transitionDuration")&&this.style.setProperty("--local-duration",this.transitionDuration),e.has("transitionFunction")&&this.style.setProperty("--local-transition",this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty("--local-transition",this.transitionFunction),this.style.setProperty("--local-duration",this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(e=>{for(const t of e)if(t.target===this.getWrapper()){let e=t.contentRect.height;const o=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0");this.mobileFullScreen?(e=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-o,this.style.setProperty("--local-border-bottom-radius","0px")):(e+=o,this.style.setProperty("--local-border-bottom-radius",o?"var(--apkt-borderRadius-5)":"0px")),this.style.setProperty("--local-container-height",`${e}px`),"0px"!==this.previousHeight&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${e}px`}}),this.resizeObserver.observe(this.getWrapper()),this.updateContainerHeight(),window.addEventListener("resize",this.onViewportResize),window.visualViewport?.addEventListener("resize",this.onViewportResize)}disconnectedCallback(){const e=this.getWrapper();e&&this.resizeObserver&&this.resizeObserver.unobserve(e),window.removeEventListener("resize",this.onViewportResize),window.visualViewport?.removeEventListener("resize",this.onViewportResize)}render(){return i.qy`
      <div class="container" data-mobile-fullscreen="${(0,r.J)(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${(0,r.J)(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(e){const t=e.split(",").filter(Boolean),o=this.historyState.split(",").filter(Boolean),i=o.length,a=t.length,r=t[t.length-1]||"",n=z.Zv.cssDurationToNumber(this.transitionDuration);let s="";a>i?s="next":a<i?s="prev":a===i&&t[a-1]!==o[i-1]&&(s="next"),this.viewDirection=`${s}-${r}`,setTimeout(()=>{this.historyState=e,this.setView?.(r)},n),setTimeout(()=>{this.viewDirection=""},2*n)}getWrapper(){return this.shadowRoot?.querySelector("div.page")}updateContainerHeight(){const e=this.getWrapper();if(!e)return;const t=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0");let o=0;this.mobileFullScreen?(o=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-t,this.style.setProperty("--local-border-bottom-radius","0px")):(o=e.getBoundingClientRect().height+t,this.style.setProperty("--local-border-bottom-radius",t?"var(--apkt-borderRadius-5)":"0px")),this.style.setProperty("--local-container-height",`${o}px`),"0px"!==this.previousHeight&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${o}px`}getHeaderHeight(){return 60}};Je.styles=[Ye],Xe([(0,a.MZ)({type:String})],Je.prototype,"transitionDuration",void 0),Xe([(0,a.MZ)({type:String})],Je.prototype,"transitionFunction",void 0),Xe([(0,a.MZ)({type:String})],Je.prototype,"history",void 0),Xe([(0,a.MZ)({type:String})],Je.prototype,"view",void 0),Xe([(0,a.MZ)({attribute:!1})],Je.prototype,"setView",void 0),Xe([(0,a.wk)()],Je.prototype,"viewDirection",void 0),Xe([(0,a.wk)()],Je.prototype,"historyState",void 0),Xe([(0,a.wk)()],Je.prototype,"previousHeight",void 0),Xe([(0,a.wk)()],Je.prototype,"mobileFullScreen",void 0),Je=Xe([(0,z.EM)("w3m-router-container")],Je)}}]);