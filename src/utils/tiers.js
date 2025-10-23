// deterministic grade -> tier mapping and item catalog
export function gradeToTier(score) {
  if (score === null || score === undefined) return 'starter';
  if (score >= 95) return 'legendary';
  if (score >= 90) return 'platinum';
  if (score >= 80) return 'gold';
  if (score >= 70) return 'silver';
  if (score >= 60) return 'bronze';
  return 'starter';
}

export function getItemsForTier(tier) {
  const catalog = {
    starter: [{ id: 'cloth-set', name: 'Cloth Set', rarity: 'common' }],
    bronze: [{ id: 'bronze-set', name: 'Bronze Set', rarity: 'common' }],
    silver: [{ id: 'silver-set', name: 'Silver Set', rarity: 'uncommon' }],
    gold: [{ id: 'gold-set', name: 'Gold Set', rarity: 'rare' }],
    platinum: [{ id: 'platinum-set', name: 'Platinum Set', rarity: 'epic' }],
    legendary: [{ id: 'legendary-set', name: 'Legendary Set', rarity: 'legendary' }]
  };
  return catalog[tier] || catalog.starter;
}