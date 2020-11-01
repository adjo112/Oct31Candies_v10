import { LightningElement, track, api } from "lwc";
import FIRSTNAME_FIELD from "@salesforce/schema/Contact.FirstName";
import LASTNAME_FIELD from "@salesforce/schema/Contact.LastName";
import EMAIL_FIELD from "@salesforce/schema/Contact.Email";
import createContact from "@salesforce/apex/OrderClass.createContact";
import updateOrder from "@salesforce/apex/OrderClass.updateOrder";
import getContact from "@salesforce/apex/OrderClass.getContact";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";

export default class OrderPage extends NavigationMixin(LightningElement) {
  flag1;
  city;
  reward;
  amount;
  paymentMode;
  conId;
  newConId;
  debitPay;
  pay;
  @api Name = "";
  @api Image = "";
  @api Price = "";
  @api Count = "";
  @api subtotal = "";
  @api total = "";
  @api prodId = "";
  @api OrderId = "";
  @api quantity = "";
  @track error;
  @track flag;
  @track rec = {
    FirstName: FIRSTNAME_FIELD,
    LastName: LASTNAME_FIELD,
    Email: EMAIL_FIELD
  };
  get options() {
    return [
      { label: "10% OFF", value: "10% OFF" },
      { label: "20% OFF", value: "20% OFF" },
      { label: "42% OFF", value: "42% OFF" }
    ];
  }
  get payment() {
    return [
      { label: "Credit/Debit Card", value: "Credit/Debit Card" },
      { label: "Google Pay", value: "Google Pay" },
      { label: "Phone Pe", value: "Phone Pe" }
    ];
  }

  handleChange(event) {
    this.flag = false;
    this.reward = event.target.value;
  }
  handleEmailChange(event) {
    this.rec.Email = event.target.value;
  }
  handleFnameChange(event) {
    this.rec.FirstName = event.target.value;
  }
  handleLnameChange(event) {
    this.rec.LastName = event.target.value;
  }
  handleClick() {
    if(this.subtotal>1000){
    this.flag = true;
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Success",
        message: "You are eligible for this discount coupon",
        variant: "success"
      })
    );
    if(this.reward=='10% OFF'){
      let discount;
      discount=this.subtotal/10;
      this.subtotal=this.subtotal-discount;
    }
    else{
      let discount;
      discount=this.subtotal/20;
      this.subtotal=this.subtotal-discount;
    }
    }
    else{
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error",
          message: "Sorry!! You are not eligible for this discount coupon",
          variant: "error"
        })
      );
    }
    }
  handlePayment(event) {
    this.paymentMode = event.target.value;
    if(this.paymentMode=='Credit/Debit Card'){
      this.debitPay=true;
      this.pay=false;
    }
    else{
      this.pay=true;
      this.debitPay=false;
    }
  }
  handleAddress(event) {
    this.Address = event.target.value;
  }
  handleCity(event) {
    this.city = event.target.value;
  }
  submitOrder() {
    this.flag1 = false;
    console.log('just entered submit order');
    getContact().then((result) => {
      this.contacts = result;
      console.log(this.contacts);
      console.log('promise then get contacts');
    });

    //
    setTimeout(() => {
      
      for (var i = 0; i < this.contacts.length; i++) {
        console.log('inside for 1st line 121');
        if (this.contacts[i].Email == this.rec.Email) {
          console.log(this.contacts[i].Email);
          this.conId = this.contacts[i].Id;
          console.log(this.conId);
          this.flag1 = true;
          break;
        }
      }
      if (this.flag1) {
        console.log('inside line 131');
        this.flag1 = false;
        console.log(this.OrderId, this.conId);
        updateOrder({
          orderId: this.OrderId,
          contactId: this.conId,
          address: this.Address,
          amount: this.total,
          payment:this.paymentMode,
          quant : this.Count
        })
          .then((result) => {
            console.log('inside line 142');
            console.log(result);
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Success",
                message: "Order Placed Successfully",
                variant: "success"
              })
            );
          })
          .catch((error) => {
            this.error = error;
            console.log(this.error);
            const evt = new ShowToastEvent({
              title: "Error",
              message: "Error while Placing Order",
              variant: "error"
            });
            this.dispatchEvent(evt);
          });
      } else {
        this.createNewContact();
      }

    }, 1200);
   /*
    for (var i = 0; i < this.contacts.length; i++) {
      console.log('inside for 1st line 121');
      if (this.contacts[i].Email == this.rec.Email) {
        console.log(this.contacts[i].Email);
        this.conId = this.contacts[i].Id;
        console.log(this.conId);
        this.flag1 = true;
        break;
      }
    }
    if (this.flag1) {
      console.log('inside line 131');
      this.flag1 = false;
      console.log(this.OrderId, this.conId);
      updateOrder({
        orderId: this.OrderId,
        contactId: this.conId,
        address: this.Address,
        amount: this.total,
        payment:this.paymentMode,
        quant : this.Count
      })
        .then((result) => {
          console.log('inside line 142');
          console.log(result);
          this.dispatchEvent(
            new ShowToastEvent({
              title: "Success",
              message: "Order Placed Successfully",
              variant: "success"
            })
          );
        })
        .catch((error) => {
          this.error = error;
          console.log(this.error);
          const evt = new ShowToastEvent({
            title: "Error",
            message: "Error while Placing Order",
            variant: "error"
          });
          this.dispatchEvent(evt);
        });
    } else {
      this.createNewContact();
    }
    */
    // last timeout
  }
  createNewContact() {
    console.log('167');
    createContact({ con: this.rec })
      .then((result) => {
        console.log('inside for 1st line 170 then');
        this.rec = {};
        this.contacts = result;
        this.newConId = this.contacts.Id;
        console.log(this.newConId);
        this.updateOrderContact();
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Contact Created Successfully",
            variant: "success"
          })
        );
      })
      .catch((error) => {
        this.error = error;
        console.log(this.error);
        const evt = new ShowToastEvent({
          title: "Error",
          message: "Error while creating contact",
          variant: "error"
        });
        this.dispatchEvent(evt);
      });
  }
  updateOrderContact() {
    console.log('inside line 196');
    updateOrder({
      orderId: this.OrderId,
      contactId: this.newConId,
      address: this.Address,
      amount: this.total,
      payment:this.paymentMode,
      quant : this.Count
    })
      .then((result) => {
        console.log('inside for 1st line 205');
        console.log(result);
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Order Placed Successfully",
            variant: "success"
          })
        );
      })
      .catch((error) => {
        this.error = error;
        console.log(this.error);
        const evt = new ShowToastEvent({
          title: "Error",
          message: "Error while Placing Order",
          variant: "error"
        });
        this.dispatchEvent(evt);
      });
  }
  //breadCrumbs navigation
  navigateToDetailsPage(event) {
    let compDefinition = {
      componentDef: "c:candiesPopup",
      attributes: {
        ParentMessageName: this.Name,
        ParentMessageImage: this.Image,
        ParentMessagePrice: this.Price,
        ParentMessageQuantity: this.quantity
      }
    };
    // Base64 encode the compDefinition JS object
    let encodedCompDef = btoa(JSON.stringify(compDefinition));
    console.log("eventId:" + event.target.dataset.recordId);
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url: "/one/one.app#" + encodedCompDef
      }
    });
  }
}
