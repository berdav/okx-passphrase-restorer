#!/usr/bin/env node

const fs = require('node:fs');
const os = require('os');
const { argv, exit } = require('node:process');
const { Level } = require('level');
const crypto = require('crypto');
const subtleCrypto = crypto.subtle;

async function deriveKey(password, salt, iterations, hash, keyLength = 32) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const passwordKey = await subtleCrypto.importKey( "raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveBits"]);

    const derivedBits = await subtleCrypto.deriveBits(
        { name: "PBKDF2", salt: salt, iterations: iterations, hash: hash, },
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

async function getMnemonicPassphrases(extension_name, os_platform, os_cpu, basePassword, keyringcontroller) {
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
            hash_payload += os_platform;

	if (vault.keyMetadata.params.randomPasswordParams.successfulList[1])
            hash_payload += extension_name;

	if (vault.keyMetadata.params.randomPasswordParams.successfulList[2])
            hash_payload += os_cpu;

        console.log(hash_payload);
        const random_password = crypto.createHash('sha256').update(hash_payload).digest('hex');
        password = basePassword + random_password;
    }

    const salt = Buffer.from(vault.salt, 'base64');
    const data = Buffer.from(vault.data, 'base64');
    const iv = Buffer.from(vault.iv, 'base64');

    const keyLength = 32;

    const derivedKey = await deriveKey(password, salt, iterations, hash, keyLength);
    const decrypted = await decrypt(derivedKey, iv, data);
    const td = new TextDecoder('utf-8');
    hd_node = JSON.parse(td.decode(decrypted))[0];
    return hd_node.data.mnemonic;
}

function getExtensionName(path) {
    const data = fs.readFileSync(path + '/LOG', 'utf8');
    let ext_name = 'mcohilncbfahbmgdjkbpemcciiolgcge';
    data.split('\n').forEach((line) => {
         if (line.search('Local Extension Settings') != -1) {
             const ext_path = line.split("Local Extension Settings")[1];
             ext_name = ext_path.split(/[\\/]/)[1];
	 }
    });
    return ext_name;
}

(async () => {
    if (argv.length < 3) {
        console.error("Usage: okx-toolkit <password> [leveldb directory] [OS string (linux / win)] [CPU string]")
	exit(1);
    }

    let leveldb_path = "vault"
    if (argv.length > 3)
        leveldb_path = argv[3];

    let os_platform = os.platform().replace("win32", "win");
    if (argv.length > 4)
        os_platform = argv[4];

    let os_cpu = os.cpus()[0].model;
    if (argv.length > 5)
        os_cpu = argv[5];

    // Guess the extension name
    const extension_name = getExtensionName(leveldb_path);

    console.log("Platform: ", os_platform);
    console.log("CPU:      ", os_cpu);
    console.log("EXT name: ", extension_name);

    // Get details from leveldb
    const db = new Level(leveldb_path);
    const keyringcontroller = JSON.parse(await db.get('KeyringController'));
    const password = argv[2];
    console.log(keyringcontroller)

    passphrases = await getMnemonicPassphrases(extension_name, os_platform, os_cpu, password, keyringcontroller);
    console.log(passphrases);
})();

