

var myKeys = [];
var myItems = [];
var allProducts = [];
localforage.clear();
function getProducts() {
    var productsHTML = document.getElementById('productsPart');
    productsHTML.innerHTML = '';
    axios.get('https://faker-api-yczfsfkfcd.now.sh/api/products')
        .then(function (response) {
            displayProductHTML(response.data.data);
            console.log(response.data.data);
        })
        .catch(function (error) {
            console.log(error);
        });
    function displayProductHTML(products) {
        let self = this;
        for (var productIndex = 0; productIndex < products.length; productIndex ++) {
            var product = products[productIndex];
            var productTitle = products[productIndex].title;
            var productDescription = products[productIndex].description;
            var productImage = products[productIndex].image;
            var productPrice = products[productIndex].price;
            allProducts.push(product);
            productsHTML.innerHTML +=
                '<div class = "card">' +
                '<h4><b>' + productTitle + '</b></h4>' +
                '<p>' + productDescription + '</p>' +
                '<div class = "footerCard textalignedcenter">' +
                '<button onclick = "prepareToAddItems(\'' + productIndex + '\')" class = "button"' +
                '<p>' + productPrice + '</p>' +
                '</button>' +
                '<button onclick = "getMyItems()" class = "button"' +
                '<p> getMyItems </p>' +
                '</button>' +
                '<button onclick = "hasProduct(\'' + productIndex + '\' )" class = "button"' +
                '<p> has product?</p>' +
                '</button>' +
                '<button onclick = "removeProduct(\'' + productIndex + '\')" class = "button"' +
                '<p> remoove </p>' +
                '</button>' +
                '<button onclick = "getTotal()" class = "button"' +
                '<p> total </p>' +
                '</button>' +
                '</div>';

        }
    }
}
function findKeyOfProduct(productId) {
    // gets the index of a PRODUCT 
    var key = -1;
    console.log('my items are ' + myItems);
    myItems.forEach(item => {
        if (item.product.id === productId) {
            console.log('item\'s product is ' + item.product.id);
            key = item.key;
        }
    });
    return key;
}

function hasProductPromise(productIndex) {
    console.log('in promise');
    return new Promise(resolve, reject => {
        // check if cart has this product if yes get the key and return it if no reject
        var productToBeQueried = allProducts[productIndex];
        var productId = productToBeQueried.id;
        let found = false;
        localforage.keys().then(keys => {
            console.log('keys returned from has Product are:  ' + keys);
            if (keys.length === 0) {
                found = false;
                reject('EMPTY LOCALFORAGE')
            }
            searchInList(keys);
        });
    });
    function searchInList(keys) {
        console.log('searching')
        const promises = keys.map(key => {
            this.localforage.getItem(key).then(value => {
                checkIfEquals(value);
            });
        });
    }
    function checkIfEquals(value) {
        console.log('in check if equals');
        if (value.product.id === productId) {
            console.log('cart has this product returning true');
            found = true;
            var itemKey = this.findKeyOfProduct(allProducts[productIndex].id);
            resolve(itemKey);
        }
        else {
            console.log('cart doesnt have this product returning false');
            found = false;
        }
    }
    if (found == false) {
        reject('DOESN\'T EXIST');
    }
}

function hasProduct(productIndex) {
    return new Promise(async resolve => {
        var productToBeQueried = allProducts[productIndex];
        var productId = productToBeQueried.id;
        let found = false;
        var keys = await localforage.keys();
        console.log('keys returned from has Product are:  ' + keys);
        if (keys.length === 0) {
            console.log('empty localForage returning false');
            found = false;
        }
        searchInList(keys);

        function searchInList(keys) {
            keys.map(async key => {
                var value = await localforage.getItem(key);
                checkIfEquals(value);
            });
        }
        function checkIfEquals(value) {
            if (value.product.id === productId) {
                console.log('in check if equals cart has this product returning true');
                found = true;
            }
            else {
                console.log('in check if equals cart doesnt have this product returning false');
                found = false;
            }
        }
        resolve(found);
    });
}

function getMyItems() {
    const result = [];
    myItems = [];
    this.localforage.keys().then(keys => {
        if (keys.length === 0) {
            console.log('empty localForage');
        }
        getValues(keys);
        myKeys = keys;
        console.log('saving keys to global variable with: ' + keys);
    });
    function getValues(keys) {
        const promises = keys.map(key => {
            this.localforage.getItem(key).then(value => {
                putInArray(value);
            });
        });
    }
    function putInArray(value) {
        result.push(value);
        myItems.push(value);
    }
    console.log(myItems);
    return result;
}
// decides whether to add a new item or increment count and price of old one
function prepareToAddItems(productIndex) {

    var productToBeQueried = allProducts[productIndex];
    var productId = productToBeQueried.id;
    let found = false;

    localforage.keys().then(keys => {
        console.log('keys returned from has Product are:  ' + keys);
        if (keys.length === 0) {
            console.log('empty localForage creating new object');
            found = false;
            createNewItem(productIndex);
        }
        else {
            searchInList(keys);
        }
    });

    function searchInList(keys) {
        var found = false;
        var keysLength = keys.length;
        console.log('length of keys is: ' + keysLength);
        for (var i = 0; i < keysLength; i++) {
            
            console.log('iteration number: ' + i);
            var currKey = keys[i];
            localforage.getItem(currKey).then(value => {
                console.log(value);
                if (value.product.id === productId && found === false) {
                    console.log('in condition 1 found product and found is false')
                    found = true;
                    replaceOldItem(currKey, productIndex);
                    return;
                }
                else if (i === keysLength && found === false) {
                    console.log('in lase iteraation and found is false');
                    createNewItem(productIndex);
                    return;
                }
            });
        }

    }
}

function replaceOldItem(itemKey, productIndex) {
    console.log('replacing old value');
    localforage.getItem(itemKey).then(oldItem => {
        console.log('old item is: ' + oldItem);
        console.log('key is: ' + itemKey);
        updateValuesOfOldItem(itemKey, oldItem);
    });
    function updateValuesOfOldItem(itemKey, oldItem) {
        var oldCount = Number(oldItem.count);
        var oldPrice = Number(oldItem.price);
        var thisPrice = Number(allProducts[productIndex].price);
        localforage.setItem(itemKey, {
            product: allProducts[productIndex], count: oldCount + 1, price: thisPrice + oldPrice
        }).then(newItem => {
            console.log('after incrementing count: ' + newItem.count + ' and price ' + newItem.price);
        });
    }
}
function createNewItem(productIndex) {
    console.log('creating a new item');
    var productToBeAdded = allProducts[productIndex];
    const newProductPrice = Number(productToBeAdded.price);
    let newItem = { product: productToBeAdded, count: 1, price: newProductPrice };
    localforage.setItem(chance.string(), newItem).then(newAddedItem => {
        console.log('brand new item is: ' + newAddedItem.count + ', with price: ' + newAddedItem.price);
    });
}
function removeProduct(productIndex) {
    const productId = allProducts[productIndex].id;
    this.localforage.keys().then(keys => {
        if (keys.length === 0) {
            console.log('empty localForage');
        }
        getValues(keys);
    });
    function getValues(keys) {
        for (var i = 0; i < keys.length; i++) {
            localforage.getItem(keys[i]).then(value => {
                if (value.product.id == productId) {
                    console.log(value.product.count);
                }
            })
        }
    }
}
function decrementCount(itemKey, productIndex) {
    console.log('decrementing count');
    localforage.getItem(itemKey).then(value => {
        var newValue = value;
        const oldCount = Number(value.count);
        const oldPrice = Number(value.price);
        const productPrice = Number(allProducts[productIndex].price);
        newValue.count = value.count - 1;
        newValue.price = oldPrice - productPrice;
        localforage.setItem(itemKey, newValue).then(value => {
            console.log(value);
        });
    });
}
function removeItem(key) {
    console.log('removing item');
    localforage.removeItem(key).then(value => {
        getMyItems();
    });
}
function getTotal() {
    var total = 0;
    this.localforage.keys().then(keys => {
        if (keys.length === 0) {
            console.log('empty localForage');
        }
        getValues(keys);
    });
    function getValues(keys) {
        var keysLength = keys.length;
        var i = 1;
        keys.map(key => {
            this.localforage.getItem(key).then(value => {
                productPrice = Number(value.price);
                total += productPrice;
                i++;
                if (i == keysLength) {
                    console.log('should enter here once');
                    console.log(total);
                    return total;
                }
            });

        });
    }
}

function clear() {
    localforage.clear();
}
