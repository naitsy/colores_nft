import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Color from '../abis/Color.json';

class App extends Component {

	constructor( props ){
		super(props);
		this.state = {
			account: "",
			contract: null,
			total_supply: 0,
			colors: []
		}
	}


	async componentWillMount(){
		await this.loadWeb3();
		await this.loadBlockchainData();
	}


	// Intenta conectar con la wallet por web3
	async loadWeb3(){
		if ( window.ethereum ){
			window.web3 = new Web3(window.ethereum);
			await window.ethereum.enable();
		} else if ( window.web3 ){
			window.web3 = new Web3( window.web3.currentProvider);
		} else {
			window.alert("No hay wallet disponible");
		}
	} 

	// carga los datos de la blockchain
	async loadBlockchainData(){
		const web3 = window.web3;
		const accounts = await web3.eth.getAccounts();

		this.setState({ account: accounts[0] });

		const networkId = "5777"; //web3.eth.net.getId(); 
		const networkData = Color.networks[networkId];
		if ( networkData ){
			const abi = Color.abi;
			const address = networkData.address;
			const contract = new web3.eth.Contract(abi, address);
			this.setState({ contract });
			const total_supply = await contract.methods.totalSupply().call();
			this.setState({ total_supply });

			//Carga los colores
			const colors = [];
			for( var i = 0; i < total_supply; i++ ){
				colors.push( await contract.methods.colors(i).call() );
			}	
			this.setState({ colors: colors });
		} else {
			window.alert("No se ha desplegado el smart contract");
		}

	}

	mint = (color) => {
		this.state.contract.methods
		.mint(color)
		.send({ from: this.state.account })
		.on("transactionHash", function(hash){
			// occurs first
		})
		.on("receipt", (receipt) => {
			console.log("receipt");
		})
		.on("confirmation", (confirmation_number, receipt) => { 
			console.log("confirmation");
			this.setState({ colors: [...this.state.colors, color] } );
		})
		.on("error", function(error){
			console.log("error: " + error);
		});
	}

	render() {
		return (
			<div>
				<nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
					<a
						className="navbar-brand col-sm-3 col-md-2 mr-0"
						href="https://blockstellart.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						Mi DApp
					</a>

					<ul className='navbar-nav px-3'>
						<li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
							<small className='text-white'>
								<span id="account">{ this.state.account }</span>
							</small>
						</li>
					</ul>

				</nav>
				<div className="container-fluid mt-5">
					<div className="row">
						<main role="main" className="col-lg-12 d-flex text-center">
							<div className="content mr-auto ml-auto">
								
								<h1>DApp NFT - Colores coleccionables</h1>

								<form action="" onSubmit={ (e) => {
									e.preventDefault();
									const color = this.color.value;
									this.mint(color);
								}}>

									<input type="text" className='form-control mb-1' placeholder='Ej: #FFFFFF'
									ref={ (input)=>{ this.color = input } } />

									<input type="submit" className="btn btn-block btn-primary" value="CREAR NFT DE COLOR" />


								</form>
								
							</div>
						</main>
						<hr />
						<div className="row text-center">
						{
							this.state.colors.map((color, key) => {
								console.log(color);
								return (
									<div key={ key } className="col-md-3">
										<div className="token" style={{ backgroundColor: color}}></div>
										<div>{ color }</div>
									</div>
								);
							})
						}	
						</div>	

					</div>
				</div>
			</div>
		);
	}
}

export default App;
