export interface IGameConfig {
    build_time: string;
    build_version: number;
    publisher: string;
    game_title: string;
    game_slug: string;
    wheel_unlock_level: number;
    second_chance_price: number;
    default_language: string;
    feedback_enabled: boolean;
    feedback_url: string;
    analytics_enabled: boolean;
    lives: ILives;
    ads: IAds;
    purchases: IPurchases;
    piggy_bank: IPiggy_bank;
    widget_button: IWidget_button;
    greetings_screen: IGreetings_screen;
    fullscreen: IFullscreen;
    pregame_boosters_unlock: IPregame_boosters_unlock;
    boosters_unlock: IBoosters_unlock;
    video_rewards: IVideo_rewards;
    wheel_rewards: IWheel_rewards;
}
interface ILives {
    initialNum: number;
    refillInterval: number;
    refillPrices: IRefillPrices;
}
interface IRefillPrices {
    lives_x1: number;
    lives_x3: number;
    lives_x5: number;
}
interface IAds {
    rewarded: boolean;
    interstitials: boolean;
    minIntervalMs: number;
}
interface IPurchases {
    enabled: boolean;
    currency: ICurrency;
}
interface ICurrency {
    code: string;
    conversionRate: number;
    template: ITemplate;
}
interface ITemplate {
    en: string;
    ru: string;
}
interface IPiggy_bank {
    enabled: boolean;
    breakMethod: string;
    max_capacity: number;
    min_amount_to_open: number;
}
interface IWidget_button {
    start_level_screen: IStart_level_screen;
    pause_screen: IPause_screen;
}
interface IStart_level_screen {
    enabled: boolean;
    frame: string;
}
interface IPause_screen {
    enabled: boolean;
    frame: string;
}
interface IGreetings_screen {
    enabled: boolean;
    displayInterval: number;
    bonus: IBonus;
    superBonus: ISuperBonus;
}
interface IBonus {
    unlimitedLivesMs: number;
    coins: number;
}
interface ISuperBonus {
    unlimitedLivesMs: number;
    coins: number;
}
interface IFullscreen {
    enabled: boolean;
}
interface IPregame_boosters_unlock {
    stripes: number;
    bomb: number;
    super_sphere: number;
}
interface IBoosters_unlock {
    glove: number;
    rolling_pin: number;
    lollipop: number;
}
interface IVideo_rewards {
    lives: number;
    extra_moves: number;
    coins: number;
    stripes: number;
    bomb: number;
    super_sphere: number;
    glove: number;
    rolling_pin: number;
    lollipop: number;
    undo: number;
}
interface IWheel_rewards {
    coins: number;
    stripes: number;
    bomb: number;
    undo: number;
    glove: number;
    rolling_pin: number;
    lollipop: number;
    super_sphere: number;
}
