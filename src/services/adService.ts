/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MonetizationSettings } from '../game/types';

export type AdRewardType =
  | 'double_coins'
  | 'level_skip_progress'
  | 'free_clue'
  | 'free_coins'
  | 'extra_moves'
  | 'extra_time'
  | 'endless_revive';

export interface AdRequestConfig {
  rewardType: AdRewardType;
  title: string;
  description: string;
  rewardValue?: number;
  onSuccess: (rewardType: AdRewardType, rewardValue?: number) => void;
  onCancel?: () => void;
  onError?: (err: string) => void;
}

class RewardedAdService {
  private isAdActive = false;

  public canShowAd(settings: MonetizationSettings): boolean {
    return settings.adsEnabled;
  }

  public isBusy(): boolean {
    return this.isAdActive;
  }

  public setAdActive(active: boolean) {
    this.isAdActive = active;
  }
}

export const adService = new RewardedAdService();
