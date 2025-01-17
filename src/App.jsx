import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState, useEffect } from 'react';
import { connectWallet, getCurrentWalletConnected } from './interact';

function App() {
  const [userWallet, setUserWallet] = useState({}); 
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState("");

  useEffect(() => {
    fetchWalletConnected();
  }, []);

  async function connectWalletPressed() {
    const wallet = await connectWallet();
    setUserWallet(wallet);
  }

  async function fetchWalletConnected() {
    const walletIsConnected = await getCurrentWalletConnected();
    setUserWallet(walletIsConnected);
  }


  async function getTokenBalance() {
    setLoading(true);
    const config = {
      apiKey: 'ey9g2UNTQ4_iE1AH6UkHen8nPmo-bXq6',
      network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);
    try {
      const data = await alchemy.core.getTokenBalances(userAddress);
      setResults(data);

      const tokenDataPromises = [];

      for (let i = 0; i < data.tokenBalances.length; i++) {
        const tokenData = alchemy.core.getTokenMetadata(
          data.tokenBalances[i].contractAddress
        );
        tokenDataPromises.push(tokenData);
      }
      setTokenDataObjects(await Promise.all(tokenDataPromises));
      
      setHasQueried(true);
      setLoading(false);
    }
    catch (e) {
      setLoading(false);
      setErrorMessages(e.message);
      return;
    }
  }
  return (
    <Box w="100vw">
      <Heading textAlign="right" mt={36} mb={36} fontSize={12} >
        {userWallet?.address? `Connected to: ${userWallet.address}`: "Not connected"}
      </Heading>
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        {!loading? (<Button fontSize={20} onClick={getTokenBalance} mt={36} bgColor="blue">
          Check ERC-20 Token Balances
        </Button>): (
          <Button fontSize={20} mt={36} bgColor="grey">
          Loading...
        </Button>
        )}

        <Heading my={36}>ERC-20 token balances:</Heading>

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
                const nominalBalance = Utils.formatUnits(
                  e.tokenBalance,
                  tokenDataObjects[i].decimals
                );
                const balanceValue = nominalBalance.length > 8 ? nominalBalance.slice(0, 8) + "..." : nominalBalance;              
              return (
                <Flex
                  flexDir={'column'}
                  color="white"
                  bg="blue"
                  w={'20vw'}
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {balanceValue}
                  </Box>
                  <Image src={tokenDataObjects[i].logo} />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          'Please make a query! This may take a few seconds...'
        )}
        {errorMessages.length > 0 && (
          <Text color="red">{errorMessages}</Text>
        )}
      </Flex>
    </Box>
  );
}

export default App;
