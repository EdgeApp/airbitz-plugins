const URL = '/person/{USER_ID}/getquota/';

export function fetchFactory(ajax) {
  return (userId) => {
    const ajaxCfg = {
      method: 'GET',
      url: URL.replace(/{USER_ID}/gi, userId)
    };

    return ajax(ajaxCfg)
      .then(resp => parse(resp.data));
  };
}

function parse(data) {
  return {
    allowTrade: data.allow_trade === true,
    currency: data.currency,
    slug: data.slug,
    isUnlimited: data.unlimited === true,
    dailyQuotaLimit: parseFloat(data.daily_limit),
    dailyQuotaUsed: parseFloat(data.daily_quotaused),
    weeklyQuotaLimit: parseFloat(data.weekly_limit),
    weeklyQuotaUsed: parseFloat(data.weekly_quotaused),
    monthlyQuotaLimit: parseFloat(data.monthly_limit),
    monthlyQuotaUsed: parseFloat(data.monthly_quotaused),
    yearlyQuotaLimit: parseFloat(data.yearly_limit),
    yearlyQuotaUsed: parseFloat(data.yearly_quotaused)
  };
}
