import { formatEther } from 'viem';

import { fetchHoldingReward, HoldingRewardSide } from '../api/holding-reward';
import {
  Address,
  buyPersonaFragments,
  calcBuyFees,
  calcSellProceeds,
  getBuyPrice,
  getPersonaOwnerFeeRate,
  getProtocolFeeRate,
  getSellPrice,
  HoldingRewardData,
  sellPersonaFragments,
} from '../contracts/persona-fragments';
import './trade-panel.css';

type TradeMode = 'buy' | 'sell';

type TradePanelOptions = {
  personaAddress: Address;
  // 트랜잭션 시 백엔드 holding-reward 를 위해 필요할 수 있는 trader 주소
  getTraderAddress?: () => Address | null | undefined;
  onTraded?: () => void; // 거래 완료 후 호출 (프로필 새로고침 등)
};

let cachedProtocolFeeRate: bigint | null = null;
let cachedPersonaOwnerFeeRate: bigint | null = null;

async function ensureFeeRates() {
  if (cachedProtocolFeeRate === null) {
    cachedProtocolFeeRate = await getProtocolFeeRate();
  }
  if (cachedPersonaOwnerFeeRate === null) {
    cachedPersonaOwnerFeeRate = await getPersonaOwnerFeeRate();
  }
  return {
    protocolFeeRate: cachedProtocolFeeRate,
    personaOwnerFeeRate: cachedPersonaOwnerFeeRate,
  };
}

async function getHoldingRewardSafe(params: {
  persona: Address;
  trader: Address;
  amount: bigint;
  side: HoldingRewardSide;
}): Promise<HoldingRewardData> {
  return fetchHoldingReward(params);
}

/**
 * 프로필 화면에서 사용하는 페르소나 조각 거래 패널
 * - 1개 이상 수량 입력
 * - Buy / Sell 토글
 * - 가격 / 수수료 / 최종 비용(또는 수령액) 미리보기
 * - 실제 스마트 컨트랙트 호출
 */
export class TradePanel {
  root: HTMLElement;
  private opts: TradePanelOptions;
  private mode: TradeMode = 'buy';

  private amountInput!: HTMLInputElement;
  private summaryPrice!: HTMLElement;
  private summaryProtocolFee!: HTMLElement;
  private summaryPersonaFee!: HTMLElement;
  private summaryTotalOrProceeds!: HTMLElement;
  private submitButton!: HTMLButtonElement;
  private errorBox!: HTMLElement;
  private modeButtons!: {
    buy: HTMLButtonElement;
    sell: HTMLButtonElement;
  };

  private previewTimer: number | null = null;

  constructor(root: HTMLElement, options: TradePanelOptions) {
    this.root = root;
    this.opts = options;

    this.buildUI();
    this.attachEvents();
  }

  private buildUI() {
    this.root.classList.add('profile-card', 'profile-trade-card');

    const title = document.createElement('h2');
    title.className = 'profile-card-title';
    title.textContent = 'Trade Fragments';

    const modeRow = document.createElement('div');
    modeRow.className = 'trade-mode-row';

    const buyBtn = document.createElement('button');
    buyBtn.type = 'button';
    buyBtn.className = 'trade-mode-btn trade-mode-btn--buy trade-mode-btn--active';
    buyBtn.textContent = 'Buy';

    const sellBtn = document.createElement('button');
    sellBtn.type = 'button';
    sellBtn.className = 'trade-mode-btn trade-mode-btn--sell';
    sellBtn.textContent = 'Sell';

    modeRow.appendChild(buyBtn);
    modeRow.appendChild(sellBtn);

    this.modeButtons = {
      buy: buyBtn,
      sell: sellBtn,
    };

    const amountRow = document.createElement('div');
    amountRow.className = 'trade-input-row';

    const amountLabel = document.createElement('label');
    amountLabel.className = 'trade-input-label';
    amountLabel.textContent = 'Amount';

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.min = '1';
    amountInput.step = '1';
    amountInput.placeholder = '1';
    amountInput.className = 'trade-input-amount';

    amountRow.appendChild(amountLabel);
    amountRow.appendChild(amountInput);
    this.amountInput = amountInput;

    const summaryBox = document.createElement('div');
    summaryBox.className = 'trade-summary-box';

    const summaryList = document.createElement('dl');
    summaryList.className = 'trade-summary-list';

    const rowPrice = document.createElement('div');
    rowPrice.className = 'trade-summary-row';
    const dtPrice = document.createElement('dt');
    dtPrice.textContent = 'Price';
    const ddPrice = document.createElement('dd');
    ddPrice.textContent = '-';
    this.summaryPrice = ddPrice;
    rowPrice.appendChild(dtPrice);
    rowPrice.appendChild(ddPrice);

    const rowProtocol = document.createElement('div');
    rowProtocol.className = 'trade-summary-row';
    const dtProtocol = document.createElement('dt');
    dtProtocol.textContent = 'Protocol Fee';
    const ddProtocol = document.createElement('dd');
    ddProtocol.textContent = '-';
    this.summaryProtocolFee = ddProtocol;
    rowProtocol.appendChild(dtProtocol);
    rowProtocol.appendChild(ddProtocol);

    const rowPersona = document.createElement('div');
    rowPersona.className = 'trade-summary-row';
    const dtPersona = document.createElement('dt');
    dtPersona.textContent = 'Persona Owner Fee';
    const ddPersona = document.createElement('dd');
    ddPersona.textContent = '-';
    this.summaryPersonaFee = ddPersona;
    rowPersona.appendChild(dtPersona);
    rowPersona.appendChild(ddPersona);

    const rowTotal = document.createElement('div');
    rowTotal.className = 'trade-summary-row trade-summary-row--emphasis';
    const dtTotal = document.createElement('dt');
    dtTotal.textContent = 'Total';
    const ddTotal = document.createElement('dd');
    ddTotal.textContent = '-';
    this.summaryTotalOrProceeds = ddTotal;
    rowTotal.appendChild(dtTotal);
    rowTotal.appendChild(ddTotal);

    summaryList.appendChild(rowPrice);
    summaryList.appendChild(rowProtocol);
    summaryList.appendChild(rowPersona);
    summaryList.appendChild(rowTotal);

    summaryBox.appendChild(summaryList);

    const errorBox = document.createElement('div');
    errorBox.className = 'trade-error';
    errorBox.style.display = 'none';
    this.errorBox = errorBox;

    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.className = 'trade-submit-btn';
    submitButton.textContent = 'Buy'; // 기본은 Buy 모드
    this.submitButton = submitButton;

    this.root.appendChild(title);
    this.root.appendChild(modeRow);
    this.root.appendChild(amountRow);
    this.root.appendChild(summaryBox);
    this.root.appendChild(errorBox);
    this.root.appendChild(submitButton);
  }

  private attachEvents() {
    this.modeButtons.buy.addEventListener('click', () => {
      this.setMode('buy');
    });
    this.modeButtons.sell.addEventListener('click', () => {
      this.setMode('sell');
    });

    this.submitButton.addEventListener('click', () => {
      this.handleSubmit().catch((err) => {
        console.error('[TradePanel] submit error', err);
      });
    });

    this.amountInput.addEventListener('input', () => {
      this.clearError();
      // 디바운스해서 미리보기 업데이트
      if (this.previewTimer !== null) {
        window.clearTimeout(this.previewTimer);
      }
      this.previewTimer = window.setTimeout(() => {
        this.updatePreview().catch((err) => {
          console.error('[TradePanel] preview error', err);
        });
      }, 400);
    });
  }

  private setMode(mode: TradeMode) {
    if (this.mode === mode) return;
    this.mode = mode;

    this.modeButtons.buy.classList.toggle(
      'trade-mode-btn--active',
      mode === 'buy',
    );
    this.modeButtons.sell.classList.toggle(
      'trade-mode-btn--active',
      mode === 'sell',
    );

    this.submitButton.textContent = mode === 'buy' ? 'Buy' : 'Sell';

    const label =
      mode === 'buy'
        ? 'Total'
        : 'Proceeds';
    this.summaryTotalOrProceeds.previousElementSibling!.textContent = label;

    this.clearError();
    this.resetSummary();
    // 모드 변경 시 현재 amount 기준으로 다시 미리보기
    this.updatePreview().catch((err) => {
      console.error('[TradePanel] preview error', err);
    });
  }

  private showError(msg: string) {
    this.errorBox.textContent = msg;
    this.errorBox.style.display = 'block';
  }

  private clearError() {
    this.errorBox.textContent = '';
    this.errorBox.style.display = 'none';
  }

  private resetSummary() {
    this.summaryPrice.textContent = '-';
    this.summaryProtocolFee.textContent = '-';
    this.summaryPersonaFee.textContent = '-';
    this.summaryTotalOrProceeds.textContent = '-';
  }

  private parseAmount(): bigint | null {
    const raw = this.amountInput.value.trim();
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      return null;
    }
    return BigInt(n);
  }

  private setLoading(loading: boolean) {
    this.submitButton.disabled = loading;
    this.amountInput.disabled = loading;
    this.modeButtons.buy.disabled = loading;
    this.modeButtons.sell.disabled = loading;
    if (loading) {
      this.submitButton.classList.add('trade-submit-btn--loading');
    } else {
      this.submitButton.classList.remove('trade-submit-btn--loading');
    }
  }

  private formatEth(wei: bigint): string {
    return `${formatEther(wei)} ETH`;
  }

  /**
   * amount 입력 시 온체인 가격/수수료 미리보기
   * - holdingReward 는 0 으로 두고 base fee 만 계산
   * - 실제 트랜잭션에서는 별도로 holdingReward 포함 계산
   */
  private async updatePreview() {
    const amount = this.parseAmount();
    if (!amount) {
      this.resetSummary();
      return;
    }

    const { personaAddress } = this.opts;
    const { protocolFeeRate, personaOwnerFeeRate } = await ensureFeeRates();

    if (this.mode === 'buy') {
      const price = await getBuyPrice(personaAddress, amount);
      const { protocolFee, personaFee, total } = calcBuyFees({
        price,
        protocolFeeRate,
        personaOwnerFeeRate,
        holdingReward: 0n,
      });

      this.summaryPrice.textContent = this.formatEth(price);
      this.summaryProtocolFee.textContent = this.formatEth(protocolFee);
      this.summaryPersonaFee.textContent = this.formatEth(personaFee);
      this.summaryTotalOrProceeds.textContent = this.formatEth(total);
    } else {
      const price = await getSellPrice(personaAddress, amount);
      const { protocolFee, personaFee, proceeds } = calcSellProceeds({
        price,
        protocolFeeRate,
        personaOwnerFeeRate,
        holdingReward: 0n,
      });

      this.summaryPrice.textContent = this.formatEth(price);
      this.summaryProtocolFee.textContent = this.formatEth(protocolFee);
      this.summaryPersonaFee.textContent = this.formatEth(personaFee);
      this.summaryTotalOrProceeds.textContent = this.formatEth(proceeds);
    }
  }

  private async handleSubmit() {
    this.clearError();

    const amount = this.parseAmount();
    if (!amount) {
      this.showError('Please enter a valid integer amount (1 or more).');
      return;
    }

    const trader =
      (this.opts.getTraderAddress && this.opts.getTraderAddress()) || null;
    if (!trader) {
      this.showError('Wallet not connected or trader address not available.');
      return;
    }

    this.setLoading(true);
    try {
      const { personaAddress } = this.opts;
      const { protocolFeeRate, personaOwnerFeeRate } = await ensureFeeRates();

      if (this.mode === 'buy') {
        // ===== BUY FLOW =====
        const price = await getBuyPrice(personaAddress, amount);
        const holdingReward = await getHoldingRewardSafe({
          persona: personaAddress,
          trader,
          amount,
          side: 'buy',
        });

        const { protocolFee, personaFee, total } = calcBuyFees({
          price,
          protocolFeeRate,
          personaOwnerFeeRate,
          holdingReward: holdingReward.rewardRatio, // 서버 설계에 따라 수정 가능
        });

        // 최종 값으로 요약 업데이트
        this.summaryPrice.textContent = this.formatEth(price);
        this.summaryProtocolFee.textContent = this.formatEth(protocolFee);
        this.summaryPersonaFee.textContent = this.formatEth(personaFee);
        this.summaryTotalOrProceeds.textContent = this.formatEth(total);

        const { hash, receipt } = await buyPersonaFragments({
          persona: personaAddress,
          amount,
          holdingReward,
          totalValueWei: total,
        });

        console.log('[TradePanel] buy tx sent', hash, receipt);
        if (this.opts.onTraded) {
          this.opts.onTraded();
        }
      } else {
        // ===== SELL FLOW =====
        const price = await getSellPrice(personaAddress, amount);
        const holdingReward = await getHoldingRewardSafe({
          persona: personaAddress,
          trader,
          amount,
          side: 'sell',
        });

        const { protocolFee, personaFee, proceeds } = calcSellProceeds({
          price,
          protocolFeeRate,
          personaOwnerFeeRate,
          holdingReward: holdingReward.rewardRatio,
        });

        this.summaryPrice.textContent = this.formatEth(price);
        this.summaryProtocolFee.textContent = this.formatEth(protocolFee);
        this.summaryPersonaFee.textContent = this.formatEth(personaFee);
        this.summaryTotalOrProceeds.textContent = this.formatEth(proceeds);

        const { hash, receipt } = await sellPersonaFragments({
          persona: personaAddress,
          amount,
          holdingReward,
        });

        console.log('[TradePanel] sell tx sent', hash, receipt);
        if (this.opts.onTraded) {
          this.opts.onTraded();
        }
      }
    } catch (err: any) {
      const message =
        err?.shortMessage ||
        err?.message ||
        'Failed to submit transaction.';
      this.showError(message);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }
}
