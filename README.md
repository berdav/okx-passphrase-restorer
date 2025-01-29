# OKX Passphrase Restorer

Retrieve 12 words passphrase from a backup of your okx wallet and the
password.

TL;DR [here](https://www.youtube.com/watch?v=oemKAqQegB0) you can find a reference video.

## It worked! I want to thank you
Thank you so much. This software is obviously free of charge and developed in my free time.
If you want to say thanks you can use the following Paypal link or Cryptocurrencies addresses:

[![paypal](https://github.com/Ximi1970/Donate/blob/master/paypal_btn_donateCC_LG_1.gif)](https://www.paypal.com/donate/?business=3D84NRYJNR4TQ&no_recurring=0&item_name=Thank+you+for+using+my+software%21&currency_code=EUR)

ETH Address: `bc1qwnfhz2gn2camurx4p9n8p3rydp2k25ahukwk7a`

BTC Address: `0xC1FA61ee2fFE2ec23c9aB652C7d2b490454629d3`

## Why?

When you create an OKX wallet you shall always backup your 12 words
passphrase, which is of this format:

![12 word passphrase](img/passphrase.jpg)

There are some cases in which you forget this passphrase, and you're
just left with a backup of your okx wallet (a bunch of LevelDB files)
and your Password.

**Without your password this tool will not work** (but you can use it
in a script to crack the wallet).

## How

You need to have nodejs installed, you can install it following
[this link](https://nodejs.org/en/download) and installing it.

At this point you can install the dependencies using `npm install` in
the directory of this project.

After this, provide the password to `npm start`, for instance:
```
npm start "Proviamo123"
```
