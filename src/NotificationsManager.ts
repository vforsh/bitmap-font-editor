import { Notyf } from "notyf"
import { NotyfNotification } from "notyf/notyf.models"
import { DeepPartial, INotyfNotificationOptions } from "notyf/notyf.options"

export class NotificationsManager extends Phaser.Events.EventEmitter {
	
	public notyf: Notyf
	
	constructor() {
		super()
		
		// список доступных иконок - https://fonts.google.com/icons?selected=Material+Icons
		this.notyf = new Notyf({
			position: { x: "right", y: "bottom" },
			dismissible: true,
			ripple: false,
			types: [
				{
					type: "disabled",
					background: "gray",
					className: "notif",
					// TODO add material-icons css
					/*icon: {
						color: "white",
						className: "material-icons",
						tagName: "span",
						text: "cancel",
					},*/
				},
				{
					type: "warning",
					background: "orange",
					className: "notif",
					duration: 3000,
					// TODO add material-icons css
					/*icon: {
						color: "white",
						className: "material-icons",
						tagName: "span",
						text: "warning",
					},*/
				},
				{
					type: "success",
					className: "notif",
					duration: 3000,
					dismissible: false,
				},
				{
					type: "error",
					className: "notif",
					duration: 3000,
					dismissible: false,
				},
			],
		})
	}
	
	public warn(message: string | DeepPartial<INotyfNotificationOptions>): NotyfNotification {
		if (typeof message === 'string') {
			return this.notyf.open({ message, type: 'warning' })
		}
		
		return this.notyf.open({ ...message, type: 'warning' })
	}
	
}
