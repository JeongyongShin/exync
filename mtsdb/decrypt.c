#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <openssl/evp.h>
#include <openssl/aes.h>

#include "log.h"
#include "decrypt.h"
 
int
decode_aes_256_cbc(char *iFile, char *pText, int pLen)
{
    EVP_CIPHER_CTX *ctx = NULL;
    FILE *ifp;
    unsigned char *inData, *outData;
    int len = -1, inSize, blockSize, outLen = 0;
    
    /*
     * open encription file
     */
    ifp = fopen (iFile, "rb");
    if (ifp == NULL) {
        fprintf (stderr, "can't open file [%s]\n", iFile);
        goto clear;
    }

    /*
     * get file size
     */
    fseek (ifp, 0L, SEEK_END);
    inSize = ftell (ifp);

    /*
     * set back to normal
     */
    fseek (ifp, 0L, SEEK_SET);

    /*
     * allocate memory
     */
    inData = malloc (inSize);
    if (inData == NULL) {
        fprintf (stderr, "can't allocate in inData buffer\n");
	goto clear;
    }

    /*
     * read encryption text
     */
    fread (inData, sizeof(char), inSize, ifp);

    /*
     * setup descryption
     */
    ctx = EVP_CIPHER_CTX_new ();
    if (ctx == NULL) {
        fprintf (stderr, "can't allocate evp cipher context\n");
	goto clear;
    }
    EVP_DecryptInit_ex (ctx, EVP_aes_256_cbc(), NULL, (unsigned char *)CKEY, (unsigned char *)IVEC);

    blockSize = inSize + EVP_CIPHER_CTX_block_size (ctx);

    outData = malloc (blockSize);
    if (outData == NULL) {
        fprintf (stderr, "can't allocate in outData buffer\n");
	goto clear;
    }

    EVP_DecryptUpdate (ctx, outData, &outLen, inData, inSize);
    len = outLen;

    EVP_DecryptFinal_ex (ctx, outData + outLen, &outLen);
    len += outLen;

    if (len >= pLen) len = pLen - 1;
    memcpy (pText, outData, len);
    pText[len] = '\0';

    /*
     * clear
     */
clear:
    if (ctx != NULL) EVP_CIPHER_CTX_free (ctx);
    if (inData != NULL) free (inData);
    if (outData != NULL) free (outData);
    if (ifp != NULL) fclose (ifp);

    return len;
}   
 
#ifdef _DECRYPT_TEST_
int
main(int argc, char *argv[]) 
{   
    char iFile[256];
    char pText[256];

    if (argc != 2) {
        fprintf (stderr, "\nUsage: %s encrypt_filename\n", argv[0]);
        return -1;
    }
    snprintf (iFile, sizeof(iFile), "%s", argv[1]);

    decode_aes_256_cbc (iFile, pText, sizeof(pText));
    printf ("plain text = %s\n", pText);
}
#endif
