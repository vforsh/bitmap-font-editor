declare namespace texts {
    export interface ILanguages {
        en: En;
        ru: Ru;
        fr: Fr;
        tr: Tr;
        it: It;
        de: De;
        es: Es;
        pt: Pt;
        br: Br;
        nl: Nl;
        pl: Pl;
        jp: Jp;
    }
    export interface En {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface Ads {
        no_rewarded_ads: string;
        adblock_disable: string;
        adblock_rewarded_ads: string;
        loading: string;
        reward_in: string;
        close: string;
    }
    export interface Chapters {
        title: string;
        complete: string;
        locked: string;
        levels: string;
        coming_soon: string;
    }
    export interface Confirm_popup {
        question: string;
        decline: string;
        accept: string;
    }
    export interface Start_level_popup {
        classic_level: string;
        hard_level: string;
        goal: string;
        collect: string;
        booster_hint: string;
    }
    export interface Lives {
        title: string;
        next_life: string;
        full: string;
        unlimited: string;
        request: string;
        hint: string;
    }
    export interface Rewards {
        x2: string;
        bonus: string;
        decline: string;
    }
    export interface Stars_gift {
        collect_popover: string;
        ready: string;
        open: string;
        claim_rewards: string;
    }
    export interface Out_of_moves {
        title: string;
        subtitle: string;
        so_close: string;
    }
    export interface Second_chance {
        title: string;
        description: string;
        hint: string;
    }
    export interface Video_rewards {
        stripes: Stripes;
        bomb: Bomb;
        super_sphere: Super_sphere;
        undo: Undo;
        glove: Glove;
        rolling_pin: Rolling_pin;
        lollipop: Lollipop;
    }
    export interface Stripes {
        title: string;
        description: string;
    }
    export interface Bomb {
        title: string;
        description: string;
    }
    export interface Super_sphere {
        title: string;
        description: string;
    }
    export interface Undo {
        title: string;
        description?: string;
        hint?: string;
    }
    export interface Glove {
        title: string;
        description?: string;
        hint?: string;
    }
    export interface Rolling_pin {
        title: string;
        description?: string;
        hint?: string;
    }
    export interface Lollipop {
        title: string;
        description?: string;
        hint?: string;
    }
    export interface Pregame_boosters {
        hint: string;
        stripes: string;
        bomb: string;
        super_sphere: string;
    }
    export interface Boosters {
        undo: Undo;
        glove: Glove;
        rolling_pin: Rolling_pin;
        lollipop: Lollipop;
    }
    export interface Tutorial {
        basic_match: string;
        basic_goals: string;
        moves: string;
        stripes_match: string;
        stripes_use: string;
        bomb_match_1: string;
        bomb_use: string;
        bomb_match_2: string;
        sphere_match: string;
        sphere_use: string;
        powerup_combo: string;
        powerup_chef: string;
        powerup_chef_2: string;
        licorice: string;
        licorice_goal: string;
        marshmallow: string;
        undo_1: string;
        undo_2: string;
        drop_items: string;
        booster_glove: string;
        booster_rolling_pin: string;
        booster_lollipop: string;
    }
    export interface Feedback_dialog {
        feedback: string;
        feedback_subtitle: string;
        email: string;
        message: string;
        send: string;
        thank_you: string;
    }
    export interface Piggy_bank {
        title: string;
        warning: string;
        hint: string;
        open: string;
        close: string;
        break_it: string;
        full: string;
        not_enough: string;
    }
    export interface Graphics_quality {
        title: string;
        high: string;
        medium: string;
        low: string;
    }
    export interface Hint_delay {
        title: string;
        value: string;
        on: string;
        off: string;
    }
    export interface Shop {
        title: string;
        sale: string;
        special_offer: string;
        best_value: string;
        most_popular: string;
        show_more: string;
        ads_hint: string;
        time: string;
        discount: string;
    }
    export interface Reset_data {
        title: string;
        text: string;
        press_to_confirm: string;
    }
    export interface Greetings {
        title: string;
        bonus: string;
        super_bonus: string;
        take: string;
        hours: string;
        minutes: string;
        greeting: string;
    }
    export interface Fullscreen {
        fullscreen: string;
        enter: string;
        exit: string;
    }
    export interface Enter_name {
        title: string;
        label: string;
        hint: string;
        enter: string;
    }
    export interface Errors {
        generic_1: string;
    }
    export interface Ru {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface Fr {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface Tr {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface It {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface De {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface Es {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface Pt {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface Br {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface Nl {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface Pl {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
    export interface Jp {
        level: string;
        moves: string;
        collect: string;
        quit: string;
        quit_subtitle: string;
        tap_to_continue: string;
        tap_to_skip: string;
        wheel_lock: string;
        score: string;
        try_again: string;
        ads: Ads;
        chapters: Chapters;
        confirm_popup: Confirm_popup;
        start_level_popup: Start_level_popup;
        lives: Lives;
        rewards: Rewards;
        stars_gift: Stars_gift;
        out_of_moves: Out_of_moves;
        second_chance: Second_chance;
        video_rewards: Video_rewards;
        level_complete: string;
        level_failed: string;
        victory: string;
        pregame_boosters: Pregame_boosters;
        booster_lock: string;
        booster_hint_cookie: string;
        booster_hint_field: string;
        boosters: Boosters;
        tutorial: Tutorial;
        feedback_dialog: Feedback_dialog;
        piggy_bank: Piggy_bank;
        graphics_quality: Graphics_quality;
        hint_delay: Hint_delay;
        shop: Shop;
        reset_data: Reset_data;
        greetings: Greetings;
        fullscreen: Fullscreen;
        enter_name: Enter_name;
        errors: Errors;
    }
}

