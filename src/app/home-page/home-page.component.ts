import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Web3Service} from '../web3.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  addr:string = ''

  Web3: any;
  etherValueAddr: any = '';
  erc20List:Array<any> = [];
  avaxAmount: any;
  arrayofContractAvaxERC20:Array<any> = [];
  BnbAmount: any;
  arrayofContractBnbBep20:Array<any> = [];
  walletWonnected: any;

  constructor(private http : HttpClient, private Web3Service : Web3Service) { }

  ngOnInit(): void {
    // this.walletWonnected = localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")
    console.log(localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER"))
    if(localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER"))
    this.Web3Service.getAccounts().then((response :any) => {
      if (response){
        this.walletWonnected = true
        this.addr = response;
        this.searchAddr();
      } else {
        this.walletWonnected = false
      }
    })
  //  console.log(window.ethereum.selectedAddress)
  //   if (this.walletWonnected) {
  //     console.log(this.walletWonnected)
  //   }

  }

  searchAddr(){

    // call for ethereum blockchain
    this.http.get('https://api.etherscan.io/api?module=account&action=balance&address='+this.addr+'&tag=latest&apikey=4E2SGH1CGFYN2BK89PSQ9DQ61BW64HJEXZ')
    .subscribe((Response:any) => {
      if(Response){
          var weiAddr:number = Response.result;
        this.etherValueAddr = weiAddr/Math.pow(10,18)

      }
    });

    this.http.get('https://api.etherscan.io/api?module=account&action=tokentx&address='+this.addr+'&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=4E2SGH1CGFYN2BK89PSQ9DQ61BW64HJEXZ')
    .subscribe((Response:any) => {
      Response.result.forEach((elm:any) => {
        elm.value = elm.value.substring(0, elm.value.length - elm.tokenDecimal)
        this.erc20List.push(elm)
      });

    });

    // call for avax blockchain
    this.http.get('https://api.snowtrace.io/api?module=account&action=balance&address='+this.addr+'&tag=latest&apikey=V1NCKDAVAYGKDWBWFY9J54H2U6ZPSTVEJH')
    .subscribe((Response:any) => {
      this.avaxAmount = Response.result/Math.pow(10,18)
    })

    this.http.get('https://api.snowtrace.io/api?module=account&action=tokentx&address='+this.addr+'&sort=asc&apikey=V1NCKDAVAYGKDWBWFY9J54H2U6ZPSTVEJH')
    .subscribe((Response:any) => {
      var arraySymbolErc20Avax: any[] = [];
      Response.result.forEach((elm:any) => {
        if (arraySymbolErc20Avax.indexOf(elm.tokenSymbol) != -1){
        } else {
          arraySymbolErc20Avax.push(elm.tokenSymbol)
          this.arrayofContractAvaxERC20.push({symbol:elm.tokenSymbol, contractaddr:elm.contractAddress,decimal:elm.tokenDecimal})
        }
      });

      if (this.arrayofContractAvaxERC20){
        this.arrayofContractAvaxERC20.forEach((elm:any, index) => {
          this.http.get('https://api.snowtrace.io/api?module=account&action=tokenbalance&contractaddress='+elm.contractaddr+'&address='+this.addr+'&tag=latest&apikey=V1NCKDAVAYGKDWBWFY9J54H2U6ZPSTVEJH')
        .subscribe((Response:any) => {
          this.arrayofContractAvaxERC20[index] = {symbol:elm.symbol, contractaddr:elm.contractaddr, value:Response.result/Math.pow(10,elm.decimal)}

        })
        });
      }

    })

    // call for bsc blockchain
    this.http.get('https://api.bscscan.com/api?module=account&action=balance&address='+this.addr+'&apikey=DSTN55ZNRITSUDM28USD2QTDK8VJQYHIPX')
    .subscribe((Response:any) => {
      this.BnbAmount = Response.result/Math.pow(10,18)
    })

    this.http.get('https://api.bscscan.com/api?module=account&action=tokentx&address='+this.addr+'&sort=asc&apikey=DSTN55ZNRITSUDM28USD2QTDK8VJQYHIPX')
    .subscribe((Response:any) => {
      var arraySymbolBep20bnb: any[] = [];
      Response.result.forEach((elm:any) => {
        if (arraySymbolBep20bnb.indexOf(elm.tokenSymbol) != -1){
        } else {
          arraySymbolBep20bnb.push(elm.tokenSymbol)
          this.arrayofContractBnbBep20.push({symbol:elm.tokenSymbol, contractaddr:elm.contractAddress,decimal:elm.tokenDecimal})
        }
      });

      if (this.arrayofContractBnbBep20){
        this.arrayofContractBnbBep20.forEach((elm:any, index) => {
            this.http.get('https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress='+elm.contractaddr+'&address='+this.addr+'&tag=latest&apikey=DSTN55ZNRITSUDM28USD2QTDK8VJQYHIPX')
            .subscribe((Response:any) => {
              this.arrayofContractBnbBep20[index] = {symbol:elm.symbol, contractaddr:elm.contractaddr, value:Response.result/Math.pow(10,elm.decimal)}

            })

        });
      }

    })


  }

  openMetaMask(){
    this.Web3Service.connectAccount().then((response :any) => {
      console.log(response);
      this.addr = response;
      this.walletWonnected = true
      this.searchAddr();
    }).catch((error: any) => {
      console.error(error);
    });
  }

  disco(){
    // await provider.close();

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavior.
    //  this.Web3Service.web3Modal.clearCachedProvider();
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER")
     this.Web3Service.disconnectWallet()
    //  this.walletWonnected = false
     window.location.reload();
    // provider = null;
  }

}
