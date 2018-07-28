import {Component} from '@angular/core';
import {NavController, LoadingController, AlertController} from 'ionic-angular';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial';

import {DetailPage} from '../detail/detail';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    unpairedDevices: any;
    pairedDevices: any;
    gettingDevices: Boolean;

    constructor(private bluetoothSerial: BluetoothSerial,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController,
                public navCtrl: NavController) {
    }

    ionViewDidEnter() {
        this.bluetoothSerial.enable();
        this.bluetoothSerial.isEnabled().then((enb) => {
            this.scanDevices();
        },() => {
            this.bluetoothSerial.enable();
        });
    }

    scanDevices() {
        this.pairedDevices = null;
        this.unpairedDevices = null;
        this.gettingDevices = true;
        this.presentLoading().present();

        this.bluetoothSerial.discoverUnpaired().then((data) => {
            this.unpairedDevices = data;
            this.bluetoothSerial.list().then((data) => {
                this.pairedDevices = data;
                setTimeout(() => {
                    this.gettingDevices = false;
                    this.presentLoading().dismiss();
                }, 5000, 'Scan complete');
            }, (err) => {
                console.log(err, 'Bluetooth Serial List');
                this.presentLoading().dismiss();
                this.showAlert('Error', err);
            })
        }, (err) => {
            console.log(err, 'Bluetooth Discover Unpaired');
            this.presentLoading().dismiss();
            this.showAlert('Error', err);
        });
    }

    selectDevice(device: any) {

        let alert = this.alertCtrl.create({
            title: 'Connect',
            message: 'Do you want to connect with?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Connect',
                    handler: () => {
                        this.bluetoothSerial.connect(device.address).subscribe((data) => {
                            this.navCtrl.push(DetailPage, {
                                device: device
                            }, {animate: true, direction: "forward"});
                        }, (err) => {
                            console.log(err, 'Selected Device');
                            this.showAlert('Error', err);
                        });
                    }
                }
            ]
        });
        alert.present();

    }

    showAlert(title, message) {
        const alert = this.alertCtrl.create({
            title: title,
            subTitle: message,
            buttons: ['OK']
        });
        alert.present();
    }

    presentLoading() {
        const loader = this.loadingCtrl.create({
            content: "Scanning Device...",
            duration: 3000
        });
        return loader;
    }

}
