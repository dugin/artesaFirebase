import { Component, ViewContainerRef, Inject, ApplicationRef } from '@angular/core';
import { ColorModel } from '../model/color-model';
import { StyleModel } from '../model/style-model';
import { GlassModel } from '../model/glass-model';
import { AngularFire, FirebaseListObservable, FirebaseApp } from 'angularfire2';
import { NgForm } from '@angular/forms';
import { Modal } from 'angular2-modal/plugins/bootstrap';
import * as spinner from 'ng-spin-kit/app/spinners'
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Observer } from 'rxjs/Rx';
import * as firebase from 'firebase';



@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    form: NgForm;
    colors = new Array<ColorModel>();
    colorsTemp = new Array<ColorModel>();
    stylesMap = new Map<string, StyleModel>();
    imgPath: string;
    imgFile: File;
    desc: string;


    constructor(
        public af: AngularFire,
        public applicationRef: ApplicationRef,
        public vcRef: ViewContainerRef,
        public sanitizer: DomSanitizer,
        public modal: Modal,
        @Inject(FirebaseApp) public firebaseApp: firebase.app.App) {

        this.modal.overlay.defaultViewContainer = vcRef;


        this.getVarieties();
        this.getColors();

    }

    onBlurSRM(forms: NgForm) {

        this.setForms(forms);

        this.copyArray();

        if (forms.value.srm1 != null && forms.value.srm2 != null && typeof forms.value.srm1 === 'number' && typeof forms.value.srm2 === 'number' && forms.value.srm1 <= forms.value.srm2)
            this.checkColors(forms.value.srm1, forms.value.srm2);


    }

    onBlurStyle(forms: NgForm) {

        this.setForms(forms);

        if (forms.value.style != null || forms.value.style.length > 0) {
            let s = this.noSpaceLowerCase(forms.value.style);

            if (this.stylesMap.get(s)) {
                this.showModal('Duplicada', 'Cerveja já existe no Banco de Dados');
                this.resetForms();
            }
        }
    }

    private checkColors(srm1: number, srm2: number) {

        for (let i = this.colorsTemp.length - 1; i > -1; i--) {
            if (this.colorsTemp[i].srm >= srm1 && this.colorsTemp[i].srm <= srm2)
                continue;

            else
                this.colorsTemp.splice(i, 1);
        }

    }

    private setForms(forms: NgForm) {
        this.form = forms;
    }

    onSubmit(forms: NgForm) {

        this.setForms(forms);


        if (this.checkValue())
            this.uploadFile().subscribe((downloadURL) => {


                this.pushToFirebase(this.createBeerModel(downloadURL));

            });

    }


    private uploadFile(): Observable<string> {

        let uploadTask = this.firebaseApp.storage().ref().child('beerGlasses/' + this.imgFileName()).put(this.imgFile);

        return new Observable<string>((observer: Observer<string>) => {
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, null,
                (error) => {
                    console.log(error);

                    observer.error(error);

                }, () => {
                    observer.next(uploadTask.snapshot.downloadURL);

                })
        })

    }

    getFile(event) {

        this.imgFile = event.srcElement.files[0];

        let reader = new FileReader();

        reader.onload = (e: any) => {

            this.imgPath = e.target.result;
        };

        reader.readAsDataURL(this.imgFile);


    }

    private imgFileName(): string {

        let glassType: string = this.form.value.glass;
        let fileType = this.imgFile.name.substring(this.imgFile.name.lastIndexOf('.'));

        glassType = this.noSpaceLowerCase(glassType);

        return glassType + '' + fileType;
    }
    private createBeerModel(imgURL) {



        return new StyleModel(
            this.form.value.style,
            this.colorsTemp,
            this.form.value.srm1 + '-' + this.form.value.srm2,
            this.form.value.ibu1 + '-' + this.form.value.ibu2,
            this.form.value.percAlcool1 + '-' + this.form.value.percAlcool2,
            new GlassModel(this.form.value.glass, imgURL, null),
            this.form.value.desc,
            this.form.value.temp1 + '-' + this.form.value.temp2,

        )

    }

    private pushToFirebase(value: StyleModel) {



        let pushRef = this.af.database.list('beerGlasses')
            .push(value.glass);

        pushRef.then((resolve) => {

            value.glass.id = pushRef.key;

            this.af.database.list('beerStyles')
                .push(value)
                .then((resolve) => {
                    this.resetForms();
                    this.showModal('Sucesso', 'Cerveja inserida no Banco de Dados com sucesso')
                    this.applicationRef.tick();
                },
                (reject) => {
                    this.showModal('Erro', 'Erro na inserção da cerveja no Banco de Dados');

                })

        },

            (reject) => {
                this.showModal('Erro', 'Erro na inserção da cerveja no Banco de Dados');


            })

    }

    private resetForms() {
        this.imgFile = this.imgPath = null;

        this.form.resetForm();
        this.copyArray();

    }

    private checkValue(): boolean {

        if (this.form.value.style == null || this.form.value.style.length == 0)
            this.showModal('Erro', 'Tipo de cerveja não preenchido');

        else if (this.form.value.srm1 == null || this.form.value.srm1.length == 0 || this.form.value.srm2 == null || this.form.value.srm2.length == 0)
            this.showModal('Erro', 'SRM não preenchido');

        else if (this.form.value.percAlcool1 == null || this.form.value.percAlcool1.length == 0 || this.form.value.percAlcool2 == null || this.form.value.percAlcool2.length == 0)
            this.showModal('Erro', 'Percentual Alcoólico não preenchido');

        else if (this.form.value.ibu1 == null || this.form.value.ibu1.length == 0 || this.form.value.ibu2 == null || this.form.value.ibu2.length == 0)
            this.showModal('Erro', 'IBU não preenchido');

        else if (this.form.value.temp1 == null || this.form.value.temp1.length == 0 || this.form.value.temp2 == null || this.form.value.temp2.length == 0)
            this.showModal('Erro', 'Temperatura não preenchida');

        else if (this.form.value.glass == null || this.form.value.glass.length == 0)
            this.showModal('Erro', 'Tipo de copo não preenchido');

        else if (this.imgFile == null)
            this.showModal('Erro', 'Arquivo de imagem do copo não selecionado');

        else if (this.form.value.desc == null || this.form.value.desc.length == 0)
            this.showModal('Erro', 'Descrição não preenchida');
        else
            return true;

    }

    private copyArray() {
        this.colorsTemp = this.colors.slice(0);


    }

    private showModal(title, text) {

        this.modal.alert()
            .size('lg')
            .showClose(true)
            .title(title)
            .body('<p> ' + text + '</p>')
            .isBlocking(true)
            .open();



    }

    private getVarieties() {

        this.af.database.list('beerVarieties').subscribe(value => {

            if (this.stylesMap.size > 0)
                this.stylesMap.set(this.noSpaceLowerCase(value[value.length - 1].type), value[value.length - 1]);

            else
                for (let i = 0; i < value.length; i++)
                    this.stylesMap.set(this.noSpaceLowerCase(value[i].type), value[i]);
        });

    }

    private noSpaceLowerCase(str: string): string {
        return str.replace(/\s+/g, '').toLowerCase();


    }

    private getColors() {
        this.af.database.list('beerColors').subscribe(value => {

            for (let i = 0; i < value.length; i++)
                this.colors.push(new ColorModel(value[i].name, value[i].hex, value[i].srm, value[i].$key));

            this.copyArray();

        })



        /*
     
        this.colors.push(new ColorModel('pale straw', '#ffff45', 2));
     
        this.af.database.list('beerColors').push(new ColorModel('pale straw', '#ffff45', 2));
       
     
        this.colors.push(new ColorModel('straw', '#ffe93e', 3));
     
            this.af.database.list('beerColors').push(new ColorModel('straw', '#ffe93e', 3));
     
     
        this.colors.push(new ColorModel('pale gold', '#fed849', 4));;
     
            this.af.database.list('beerColors').push(new ColorModel('pale gold', '#fed849', 4));
     
     
        this.colors.push(new ColorModel('deep gold', '#ffa846', 6));
     
            this.af.database.list('beerColors').push(new ColorModel('deep gold', '#ffa846', 6));
     
     
        this.colors.push(new ColorModel('pale amber', '#f49f44', 9));
     
            this.af.database.list('beerColors').push(new ColorModel('pale amber', '#f49f44', 9));
     
     
        this.colors.push(new ColorModel('medium amber', '#d77f59', 12));
     
            this.af.database.list('beerColors').push(new ColorModel('medium amber', '#d77f59', 12));
     
     
        this.colors.push(new ColorModel('deep amber', '#94523a', 15));
     
            this.af.database.list('beerColors').push(new ColorModel('deep amber', '#94523a', 15));
     
     
        this.colors.push(new ColorModel('amber-brown', '#804541', 18));
     
            this.af.database.list('beerColors').push(new ColorModel('amber-brown', '#804541', 18));
     
     
        this.colors.push(new ColorModel('brown', '#5b342f', 20));
     
            this.af.database.list('beerColors').push(new ColorModel('brown', '#5b342f', 20));
     
     
        this.colors.push(new ColorModel('ruby brown', '#4c3b2b', 24));
     
            this.af.database.list('beerColors').push(new ColorModel('ruby brown', '#4c3b2b', 24));
     
     
        this.colors.push(new ColorModel('deep brown', '#38302e', 30));
     
            this.af.database.list('beerColors').push(new ColorModel('deep brown', '#38302e', 30));
     
     
        this.colors.push(new ColorModel('black', '#31302c', 40));
     
            this.af.database.list('beerColors').push(new ColorModel('black', '#31302c', 40));
     
    */




    }
}
