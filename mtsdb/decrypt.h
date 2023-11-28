#ifndef _DECRYPT_H_
#define _DECRYPT_H_

#define CKEY            "000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F"
#define IVEC            "000102030405060708090A0B0C0D0E0F"

int decode_aes_256_cbc(char *iFile, char *pText, int pLen);

#endif

