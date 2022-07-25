const dotenv = require("dotenv");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const catchAsyncFunction = require("../utilities/catchAsync");
const AppError = require("../utilities/appError");

//
// ? https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=checkout#create-product-prices-upfront

/*
//////////////////////////////
For item creation within stripe. The item created 
in stripe should share the same id as the products in the DB,
so you can use them interchagable in the code.

If item exists within stripe already an error will be thrown
//////////////////////////////
*/

exports.createItem = catchAsyncFunction(async (product, currency = "usd") => {
	//STRIPE 1 ) CREATE PRODUCT IN STRIPE
	console.log("poop");
	await stripe.products.create({
		id: product.id,
		name: product.name,
	});

	//STRIPE 2 ) ASSIGNS PRODUCT ID, UNIT AMOUNT, AND PRICE TO PRODUCT IN STRIPE
	console.log("poop2");

	await stripe.prices.create({
		product: product.id,
		unit_amount: product.price,
		currency: currency,
	});
});

/*
//////////////////////////////
CREATES A CHECOUT SESSION

MODE = CURRENCY TO PAY WITH. DEFAULT IS USD

URL = OBJECT WITH ENPOINTS AFTER THE SESSION IS COMPETED
//////////////////////////////
*/

exports.checkoutSession = catchAsyncFunction(
	async (cart, url, mode = "payment") => {
		//STRIPE 1 ) FORMATS THE ITEMS IN THE CART TO FIT THE CHECKOUT SESSION.
		const promisedLineItems = cart.map(async (products) => {
			const { quantity, product } = products;
			const prices = await stripe.prices.list({
				product: product,
				active: true,
			});
			const [priceData] = prices.data;
			return {
				price: priceData.id,
				quantity: quantity || 1,
				//currency: priceData.currency,
			};
		});
		const lineItems = await Promise.all(promisedLineItems);
		if (!lineItems)
			return new AppError("AN ERROR HAS OCCOURED WITH STRIPE", 500);
		//STRIPE 2 ) CREATES CHECOUT SESSION THE REDIRECTS THE USER TO THE PROPER URL
		const checkoutSession = await stripe.checkout.sessions.create({
			line_items: lineItems,
			payment_method_types: ["card"],
			mode: mode,
			success_url: "https://youtube.com" || url.success_url,
			cancel_url: "https://youtube.com" || url.cancel_url,
			//customer_email: req.user.email,
			//TODO: params below
			//client_reference_id: req.body.cart,
		});

		console.log(checkoutSession.id);

		//STRIPE 3 ) REDIRECT TO CHECKOUT
		//TODO: INTEGRATE THE BELOW CODE TO THE FRONTEND TO BE CALLED TO REDIRECT THE USER TO A COMPLETED CHECOUT SESSION
		// await stripe.redirectToCheckout({
		// 	sessionId: checkoutSession.id,
		// });
	}
);
