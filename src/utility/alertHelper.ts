export class AlertHelper {

    public static checkUnsavedChanges(alertCtrl, toastCtrl, isDataChanged) {
        return new Promise<boolean>((resolve) => {
            if (isDataChanged) {
                let confirm = alertCtrl.create({
                    title: 'Warning!',
                    message: 'There is unsaved data. Do you want to discard it?',
                    buttons: [
                        {
                            text: 'Discard It!',
                            handler: async () => {
                                resolve(true);
                                let toast = toastCtrl.create({
                                    message: 'The unsaved changes are now discarded.',
                                    duration: 5000
                                });
                                toast.present();
                            }
                        },
                        {
                            text: 'Let me save',
                            handler: () => {
                                resolve(false);
                            }
                        }
                    ]
                });
                confirm.present();
            } else {
                resolve(true);
            }
        });
    }
}