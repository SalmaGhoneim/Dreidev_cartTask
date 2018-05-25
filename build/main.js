'use strict';

var _product2 = require('./product');

var myItems = [];
var allProducts = [];
function getProducts() {
    var productsHTML = document.getElementById('productsPart');
    productsHTML.innerHTML = '';
    axios.get('https://faker-api-yczfsfkfcd.now.sh/api/products').then(function (response) {
        displayProductHTML(response.data.data);
        console.log(response.data.data);
    }).catch(function (error) {
        console.log(error);
    });
    function displayProductHTML(products) {
        var self = this;
        for (var productIndex = 0; productIndex < products.length; productIndex++) {
            var productId = products[productIndex].id;
            var productTitle = products[productIndex].title;
            var productDescription = products[productIndex].description;
            var productImage = products[productIndex].image;
            var productPrice = products[productIndex].price;
            var _product = new _product(productTitle, productPrice, productId, productDescription, productImage);
            allProducts.push(_product);
            productsHTML.innerHTML += '<div class = "card">' + '<h4><b>' + title + '</b></h4>' + '<p>' + description + '</p>' + '<div class = "footerCard textalignedcenter">' + '<button onclick = "addItem(\'' + productIndex + '\')" class = "button"' + '<p>' + price + '</p>' + '</button>' + '<button onclick = "getMyItems()" class = "button"' + '<p> getMyItems </p>' + '</button>' + '<button onclick = "hasProduct(\'' + productIndex + '\' )" class = "button"' + '<p> has product?</p>' + '</button>' + '</div>';
        }
    }
}
function findKeyOfProduct(productId) {
    // gets the index of a PRODUCT 
    var key = -1;
    var myItems = getMyItems();
    myItems.forEach(function (item) {
        if (item.product.id === productId) {
            console.log('item\'s product is' + item.product.id);
            key = item.key;
        }
    });
    return key;
}
function hasProduct(i) {
    console.log(allProducts[i]);
    // var x = product.id;
    // console.log(x);
    // const self = this;
    // let found = false;
    // localforage.keys().then(function (keys) {
    //     searchInList(keys);
    //     console.log('keys returned from has Product are' + keys);
    // })
    // function searchInList(keys) {
    //     const promises = keys.map(function (key) {
    //         this.localforage.getItem(key).then(function (value) {
    //             checkIfEquals(value);
    //         });
    //     });
    // }
    // function checkIfEquals(value) {
    //     console.log('in check if equals');
    //     console.log('saved product is ' + value.product.id);
    //     if (value.product.id === productId) {
    //         console.log(product.id);
    //         console.log('cart has this product');
    //         return true;
    //     }
    //     console.log('cart doesnt have this product');
    //     return false;
    // }
}
function getMyItems() {
    var self = this;
    var result = [];
    this.localforage.keys().then(function (values) {
        getValues(values);
    });
    function getValues(keys) {
        var promises = keys.map(function (key) {
            this.localforage.getItem(key).then(function (value) {
                putInArray(value);
            });
        });
    }
    function putInArray(value) {
        result.push(value);
    }
    console.log(result);
    return result;
}
function addItem(newProduct) {
    // console.log('product in add item is ' + newProduct + 'with product id ' + newProduct.id);
    // adds a PRODUCT
    if (hasProduct(newProduct)) {
        var replaceOldItem = function replaceOldItem(oldItem) {
            localforage.setItem(oldItem.key, { product: newProduct, count: oldItem.count++, price: oldItem.price + newProduct.price }).then(function (newItem) {
                console.log(newItem);
            });
        };

        // if the cart contains the same product, increment the count & the price
        var itemKey = this.findKeyOfProduct(newProduct);
        localforage.getItem(itemKey).then(function (oldItem) {
            replaceOldItem(oldItem);
        });
    } else {
        // if it a brand new product, add a new ITEM
        var newItem = { product: newProduct, count: 1, price: newProduct.price };
        localforage.setItem(chance.string(), newItem).then(function (newAddedItem) {
            console.log(newAddedItem);
        });
    }
}