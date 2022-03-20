//using 
const { assert } = require("chai");
const Color = artifacts.require("./Color.sol");

require("chai").use( require("chai-as-promised") ).should();

contract ("Color", (accounts) =>{
    let contract;

    before( async() => {
        contract = await Color.deployed();
    });

    describe("deployment", async()=>{
        it("Despliegue exitoso", async()=>{
            const address = contract.address;

            assert.notEqual(address, 0x0);
            assert.notEqual(address, "");
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });
    });

    describe("minting", async()=>{
        it("Creacion de token", async()=>{
            const result = await contract.mint("#EC058E");
            const total_supply = await contract.totalSupply();

            //Success
            assert.equal(total_supply, 1);
            const event = result.logs[0].args;
            assert.equal(event.tokenId.toNumber(), 1, "Id incorrecto");
            assert.equal(event.to, accounts[0], "Direccion destino incorrecta");

            //Fail
            await contract.mint("#EC058E").should.be.rejected;
        });
    });

    describe("Indexing", async()=>{
        it("Lista de colores", async()=>{
            
            await contract.mint("#5386E4");
            await contract.mint("#000000");
            await contract.mint("#FFFFFF");
            const total_supply = await contract.totalSupply();

            let color;
            let result = [];
            for(var i = 0; i < total_supply; i++){
                color = await contract.colors(i);
                console.log("color: " + color);
                result.push(color);
            }

            const r = contract.colors;
            // console.log("r: "+ r);
            console.log("result: " + result);
            
            const expected = ["#EC058E","#5386E4","#000000","#FFFFFF"];

            assert.equal(result.join(","), expected.join(","));

        });
    });


});