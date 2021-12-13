declare namespace Gamifive {
	
	export interface SDK {
		init(config: InitConfig): void;
		isInitialized(): boolean;
		
		onStartSession(callback:Function): void;
		startSession(): void;
		endSession(score?: Score): void;
		
		loadUserData(callback: (userData?:object) => void): void;
		saveUserData(data:object): void;
		clearUserData(): void;
		
		goToHome(): void;
		getAvatar(): Avatar;
		getNickname(): object | undefined;
		getVersion(): Version;
		
		showMoreGamesButton(position?: "TOP_LEFT" | 'BOTTOM_RIGHT' | 'TOP_RIGHT' | 'BOTTOM_LEFT'): void;
		hideMoreGamesButton(): void;
	}
	
	export interface InitConfig {
		lite: boolean;
		menuPosition: "TOP_LEFT" | 'BOTTOM_RIGHT' | 'TOP_RIGHT' | 'BOTTOM_LEFT';
	}
	
	export interface Score {
		level?: number;
		score?: number;
	}
	
	export interface Avatar {
		src: string; // URL
		nickname: string;
	}
	
	export interface Version {
		version: string;
		build: string;
	}
	
}