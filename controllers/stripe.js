const dotenv = require("dotenv");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const catchAsyncFunction = require("../utilities/catchAsync");

//
// ? https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=checkout#create-product-prices-upfront

/*
//////////////////////////////
For item creation within stripe. The item created 
in stripe should share the same id as the products in the DB,
so you can use them interchagable in the code.
//////////////////////////////
*/

export const createItem = catchAsyncFunction(
	async (product, currency = "usd") => {
		//STRIPE 1 ) CREATE PRODUCT IN STRIPE

		const stripeProduct = await stripe.products.create({
			name: product.name,
			img: product.img,
		});

		//STRIPE 2 ) ASSIGNS PRODUCT ID, UNIT AMOUNT, AND PRICE TO PRODUCT IN STRIPE

		const price = await striope.prices.create({
			product: product.id,
			unit_amount: product.price,
			currency: currency,
		});
	}
);

/*
//////////////////////////////
CREATES A CHECOUT SESSION

MODE = CURRENCY TO PAY WITH. DEFAULT IS USD

URL = OBJECT WITH ENPOINTS AFTER THE SESSION IS COMPETED
//////////////////////////////
*/

export const checkoutSession = catchAsyncFunction(
	async (cart, mode = "payment", url) => {
		const lineItems = cart.map((product) => {
			const { id, count } = product;

			return {
				price: id,
				quantity: count,
			};
		});

		const checkout = await stripe.checkout.sessions.create({
			line_items: lineItems,
			mode: mode,
			success_url: url.success,
			cancel_url: url.cancel,
		});
	}
);
