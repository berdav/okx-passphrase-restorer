#!/usr/bin/env python3

import os
import sys
import plyvel
#import argparse
import mnemonic

class OkxWallet(object):
    def __init__(self, language = 'english'):
        mnemo = mnemonic.Mnemonic(language)
        self.mnemo = mnemo


    def set_data(self, data):
        # Derive key 
        pbkdf2_hmac
        self.data = data


    def generate(self):
        return self.mnemo.to_mnemonic(self.data)

def comparator(a, b):
    a = a.lower()
    b = b.lower()

    if a < b:
        # a sorts before b
        return -1

    if a > b:
        # a sorts after b
        return 1

    # a and b are equal
    return 0

if __name__=='__main__':
    #password = os.environ["OKX_PASSWORD"]
    #okx = OkxWallet()
    #okx.set_data(password)
    #print(okx.generate())
    m1 = {}
    m2 = {}

    db = plyvel.DB(sys.argv[1], comparator_name=b'idb_cmp1', comparator=comparator)
    for k, v in db.iterator():
        m1[k] = v
    db2 = plyvel.DB(sys.argv[2], comparator_name=b'idb_cmp1', comparator=comparator)
    for k, v in db2.iterator():
        m2[k] = v

    onlym1 = 0
    onlym2 = 0
    for k in m1.keys():
        if not m2.get(k, False):
            onlym1 += 1
    for k in m2.keys():
        if not m1.get(k, False):
            onlym2 += 1

    print("m1 total keys")
    print(len(m1.keys()))
    print("m2 total keys")
    print(len(m2.keys()))
    print("Keys only in m1")
    print(onlym1)
    print("Keys only in m2")
    print(onlym2)
    different = 0
    equal = 0
    for k in m2.keys():
        try:
            if m2[k] != m1[k]:
                different += 1
            else:
                equal += 1
        except:
            continue
    print("number of equal keys")
    print(f"{equal}")
    print("number of different keys")
    print(f"{different}")
    for v in m2.values():
        print(v)
