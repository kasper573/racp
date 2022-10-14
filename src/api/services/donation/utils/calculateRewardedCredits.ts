export function calculateRewardedCredits(
  donationAmount: number,
  exchangeRate: number
) {
  return Math.floor(donationAmount * exchangeRate);
}
