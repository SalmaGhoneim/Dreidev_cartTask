var allProducts = [];
// SideBar open or not
sideBar = false;
function getProducts() {
    refreshValueOfCartNumber();
    var productsHTML = document.getElementById('productsPart');
    productsHTML.innerHTML = '';
    axios.get('https://faker-api-yczfsfkfcd.now.sh/api/products')
        .then(function (response) {
            displayProductHTML(response.data.data);
        });
    function displayProductHTML(products) {
        let self = this;
        for (var productIndex = 0; productIndex < products.length; productIndex++) {
            var product = products[productIndex];
            var productTitle = products[productIndex].title;
            var productDescription = products[productIndex].description;
            var productImage = products[productIndex].image;
            var productPrice = products[productIndex].price;
            allProducts.push(product);
            productsHTML.innerHTML +=
                '<div class="card4perLine">' +
                '<img class = "cardImage" src = \'' + productImage + '\' alt=' + productTitle + '"" style="width:100%;">' +
                '<div class="title">' +
                productTitle +
                '</div>' +
                '<button disabled class= "priceCircle" >' +
                productPrice +
                '</button>' +
                '<div class="cardBody max-lines">' +
                '<p>' +
                productDescription +
                '</p>' +
                '</div>' +
                '<div >' +
                '<button class="cardButton buttonWithHover" onClick="prepareToAddItems(\'' + productIndex + '\')" >Buy</button>' +
                '</div>' +
                '</div>';
        }
    }
}
/*
* refreshed the product total count above the cart icon 
* with total number of products
*/
function refreshValueOfCartNumber() {
    var totalProducts = 0;
    var numberHtml = document.getElementById('numberOfItems');
    var i = 0;
    numberHtml.innerHTML = [];
    getMyItems().then(items => {
        var itemsLength = items.length;
        items.map(item => {
            var itemCount = Number(item.count);
            totalProducts += itemCount
            i++;
            if (i === itemsLength) {
                numberHtml.innerHTML = totalProducts;

            }
        })
    });
}
function hasProduct(productIndex) {
    const productToBeQueried = allProducts[productIndex];
    const productId = productToBeQueried.id;
    var found = false;
    localforage.keys().then(keys => {
        var keyMatched = keys.filter(key => {
            return key == productId;
        });
        if (keyMatched.length === 0) {
            found = false;
        }
        else {
            found = true;
        }
        return found;
    });
}
/*
* a promise that when resolved gets 
* current items
*/
function getMyItems() {
    return new Promise(resolve => {
        const result = [];
        var i = 0;
        localforage.keys().then(keys => {
            var i = 0;
            var keysLength = keys.length;
            if (keysLength === 0) {
                hideClear(true);
                hideProductsAndPurchase(true);
            }
            else if(keysLength === 1 ){
                hideClear(false);
                hideProductsAndPurchase(false);
    
            }
    
            keys.map(key => {
                this.localforage.getItem(key).then(value => {
                    result.push(value);
                    i++;
                    if (i === keysLength) {
                        resolve(result);
                        return result;
                    }
                });
            });
        });
    });

}
/*
* decides whether to add a new item or increment count and price of old one
*/
function prepareToAddItems(productIndex) {

    var productToBeQueried = allProducts[productIndex];
    var productId = productToBeQueried.id + '';
    let found = false;

    localforage.keys().then(keys => {
        var keyMatched = keys.filter(key => {
            return key === productId;
        });
        if (keyMatched.length === 0) {
            createNewItem(productIndex);
        }
        else {
            replaceOldItemWhenAdding(productId);
        }
    });
}

/*
* increments count and increases price
*/
function replaceOldItemWhenAdding(productId) {
    localforage.getItem(productId).then(oldItem => {
        var oldCount = Number(oldItem.count);
        var oldPrice = Number(oldItem.price);
        var thisPrice = oldPrice / oldCount;

        localforage.setItem(productId, {
            product: oldItem.product, count: oldCount + 1, price: thisPrice + oldPrice
        }).then(newItem => {
            refreshValueOfCartNumber();
            if (sideBar) {
                refreshSideBar();
            }
        });

    });
}
/*
*  creates a new item with a new value in localforage
*/

function createNewItem(productIndex) {
    var productToBeAdded = allProducts[productIndex];
    const newProductPrice = Number(productToBeAdded.price);
    const productId = productToBeAdded.id;
    const itemKey = productId + '';
    let newItem = { product: productToBeAdded, count: 1, price: newProductPrice };
    localforage.setItem(itemKey, newItem).then(newAddedItem => {
        if (sideBar) {
            refreshSideBar();
        }
        refreshValueOfCartNumber();
    });
}
/*
* decides whether to remove the whole item or decrement count and price of old one
*/
function prepareToRemoveProduct(productId) {
    localforage.getItem(productId).then(value => {
        if (value.count > 1) {
            replaceOldItemWhenRemoving(productId);
        }
        else {
            removeItem(productId);
        }
    });
}

/*
*  decrements Count and decreses the price 
*/
function replaceOldItemWhenRemoving(productId) {
    localforage.getItem(productId).then(value => {
        var newValue = value;
        const oldCount = Number(value.count);
        const oldPrice = Number(value.price);
        const productPrice = oldPrice / oldCount;

        newValue.count = value.count - 1;
        newValue.price = oldPrice - productPrice;
        localforage.setItem(productId, newValue).then(value => {
            if (sideBar) {
                refreshSideBar();
            }
            refreshValueOfCartNumber();

        });
    });
}

/*
*  removes the whole item 
*/
function removeItem(key) {
    localforage.removeItem(key).then(value => {
        refreshValueOfCartNumber();


        if (sideBar) {
            refreshSideBar();
        }
    });
}
function hideClear(shouldHide) {
    var status = document.getElementById('dissapearWhenNoProduct');
    if (shouldHide) {
        status.style.display = 'none';
    } else {
        status.style.display = 'block';


    }
}
function hideProductsAndPurchase(shouldHide) {
    var status = document.getElementsByClassName('purchaseAndPrice');
        if (shouldHide) {
            status[0].style.display = 'none';
        } else {
            status[0].style.display = 'block';

        }
}




/*
*  gets the total price 
*/
function getTotal() {
    return new Promise(resolve => {
        var total = 0;
        this.localforage.keys().then(keys => {
            if (keys.length === 0) {
                resolve(0);
            }
            var keysLength = keys.length;
            var i = 0;
            keys.map(key => {
                localforage.getItem(key).then(value => {
                    productPrice = Number(value.price);
                    total += productPrice;
                    i++;
                    if (i == keysLength) {
                        resolve(total);
                    }
                });

            });
        });
    });
}

/*
*  gets the item that includes this product 
*/

function getItem(productIndex) {
    const productToBeQueried = allProducts[productIndex];
    const productId = productToBeQueried.id + '';
    localforage.getItem(productId).then(value => {
        return value;
    });
}

/*
*  refreshes sidebar with curr items 
*/

function refreshSideBar() {
    refreshTotal();
    refreshValueOfCartNumber();
    var itemsHTML = document.getElementById('itemsPart');
    itemsHTML.innerHTML = '<div class="noProductsFont centeredText">' +
        '<p> You haven\'t added any products yet! </p>' +
        '</div>';

    getMyItems().then(items => {
        itemsHTML.innerHTML = [];
        for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
            var productId = items[itemIndex].product.id;
            var productTitle = items[itemIndex].product.title;
            var productImage = items[itemIndex].product.image;
            var itemCount = items[itemIndex].count;
            itemsHTML.innerHTML +=
                '<div class="white centeredText">' +
                '<div class="sideNavBody">' +
                '<div class = "smallProductImage" style= "background-image: url(' + productImage + ');" >' +
                '<p class="count">' + itemCount + '</p>' +
                '</div>' +
                '<div class= "titleAndIcons">' +
                '<button onclick = "replaceOldItemWhenAdding(\'' + productId + '\')" class="iconButton">' +
                '<i class="fa fa-plus"></i>' +
                '</button>' +
                '<p class= "sameLine productTitleSidenav">' + productTitle + '</p>' +
                '<button onclick = "prepareToRemoveProduct(\'' + productId + '\')" class="iconButton">' +
                '<i class="fa fa-minus"></i>' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<hr class="line">';
        }
    });

}
/*
*  refreshes the total price 
*/

function refreshTotal() {
    getTotal().then(value => {
        var totalHtml = document.getElementById("totalPart");
        totalHtml.innerHTML = value;
    });
}
/*
*  clears cart 
*/
function clearCart() {
    localforage.clear().then(value => {
        refreshTotal();
        refreshSideBar();
        refreshValueOfCartNumber();
        hideClear(true);
        hideProductsAndPurchase(true);

    });
}

/*
*  control the opening and closing of the sidebar 
*/
function toggleSideBar() {
    refreshValueOfCartNumber();
    if (sideBar) {
        sideBar = false;
        closeSideBar();
    } else {
        refreshSideBar();
        sideBar = true;
        openSideBar();
    }
}

function openSideBar() {
    document.getElementById("itemsSideBar").style.width = "30%";
    document.getElementById("main").style.marginRight = "30%";
    document.getElementById("shop").style.marginLeft = "11%";

    var cards = document.getElementsByClassName("card4perLine");
    for (var i = 0; i < cards.length; i++) {
        cards[i].style.width = "70%";

    }
}

function closeSideBar() {
    document.getElementById("itemsSideBar").style.width = "0";
    document.getElementById("main").style.marginRight = "0";
    document.getElementById("shop").style.marginLeft = "0";

    var cards = document.getElementsByClassName("card4perLine");
    for (var i = 0; i < cards.length; i++) {
        cards[i].style.width = "22%";
    }
}
