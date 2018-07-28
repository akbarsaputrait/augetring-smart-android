import {Component, NgZone} from '@angular/core';
import {NavController, NavParams, LoadingController, AlertController} from 'ionic-angular';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial';

@Component({
    selector: 'page-detail',
    templateUrl: 'detail.html'
})
export class DetailPage {

    device: any;
    statusMessage: string;
    timeStarts: any = ['00:00'];
    duration: any = 0;

    constructor(private bluetoothSerial: BluetoothSerial,
                private navParams: NavParams,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController,
                private ngZone: NgZone,
                public navCtrl: NavController) {
        let device = navParams.get('device');

        this.setStatus('Connected to ' + device.name || device.id);
        this.device = device;
    }

    // Disconnect peripheral when leaving the page
    ionViewWillLeave() {
        this.bluetoothSerial.disconnect();
    }

    addTime() {
        this.ngZone.run(() => {
            this.timeStarts.push('00:00');
        });
    }

    removeTime(idx) {
        this.ngZone.run(() => {
            this.timeStarts.splice(idx, 1);
        });
    }

    saveData() {
        const schedule = this.timeStarts.join(),
            value = this.duration + '|' + schedule,
            loader = this.loadingCtrl.create({
                content: "Sending data...",
                duration: 3000
            });

        loader.present();

        this.bluetoothSerial.write(value).then((suc) => {
            console.log(suc);
            setTimeout(() => {
                loader.dismiss().then(() => {
                    this.showAlert('Success', 'Data Succesfully Saved');
                });
            }, 3000)
        }, (err) => {
            console.log(err);
            loader.dismiss().then(() => {
                this.showAlert('Error', err);
            });
        });

    }

    setStatus(message) {
        this.ngZone.run(() => {
            this.statusMessage = message;
        });
    }

    showAlert(title, message) {
        const alert = this.alertCtrl.create({
            title: title,
            subTitle: message,
            buttons: ['OK']
        });
        alert.present();
    }

}
