#!/usr/bin/env node

const os = require('os');
const { argv, exit } = require('node:process');
const { Level } = require('level');
const crypto = require('crypto');
const subtleCrypto = crypto.subtle;

async function deriveKey(password, salt, iterations, keyLength = 32) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const passwordKey = await subtleCrypto.importKey( "raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveBits"]);

    const derivedBits = await subtleCrypto.deriveBits(
        { name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256", },
        passwordKey, keyLength << 3
    );

    return derivedBits;
}

async function decrypt(key, iv, data) {
    const aesKey = await crypto.subtle.importKey( "raw", key, { name: "AES-GCM" }, true, ["decrypt"]);

    return await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        aesKey, data
    );
}

async function getMnemonicPassphrases(basePassword, keyringcontroller) {
    // TODO: Is this really useful?
    //if (keyringcontroller.version != 2) {
    //    console.error("Unsupported Keyring controller version " + keyringcontroller.version);
    //    exit(1);
    //}

    vault = JSON.parse(keyringcontroller.vaultV2)

    if (vault.keyMetadata.algorithm !== 'PBKDF2') {
        console.error("Unsupported key derivation function " + vault.keyMetadata.algorithm);
        return null;
    }

    const iterations = vault.keyMetadata.params.iterations;
    const hash = vault.keyMetadata.params.hash;
    let password = basePassword;

    if (keyringcontroller.enableRandom) {
	let hash_payload = "";
	if (vault.keyMetadata.params.randomPasswordParams.version != 1) {
            console.error("Unsupported version of random password params");
            return null;
        }
	if (vault.keyMetadata.params.randomPasswordParams.successfulList[0])
            hash_payload += os.platform;
	// Extension name
	if (vault.keyMetadata.params.randomPasswordParams.successfulList[1])
            hash_payload += 'mcohilncbfahbmgdjkbpemcciiolgcge';
	if (vault.keyMetadata.params.randomPasswordParams.successfulList[2])
            hash_payload += os.cpus()[0].model;

        const random_password = crypto.createHash('sha256').update(hash_payload).digest('hex');
        password = basePassword + random_password;
    }

    const salt = Buffer.from(vault.salt, 'base64');
    const data = Buffer.from(vault.data, 'base64');
    const iv = Buffer.from(vault.iv, 'base64');

    const keyLength = 32;

    const derivedKey = await deriveKey(password, salt, iterations, keyLength);
    const decrypted = await decrypt(derivedKey, iv, data);
    const td = new TextDecoder('utf-8');
    hd_node = JSON.parse(td.decode(decrypted))[0];
    return hd_node.data.mnemonic;
}

(async () => {
    if (argv.length < 4) {
        console.error("Usage: okx-toolkit <password> <leveldb directory>")
	exit(1);
    }

    // Get details from leveldb
    const db = new Level(argv[3]);
    const keyringcontroller = JSON.parse(await db.get('KeyringController'));
    const password = argv[2];
    console.log(keyringcontroller)

    passphrases = await getMnemonicPassphrases(password, keyringcontroller);
    console.log(passphrases);
})();

