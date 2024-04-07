package l2

import (
	"math/rand"
	"testing"

	"github.com/ethereum-optimism/optimism/op-program/client/l2/test"
	"github.com/ethereum-optimism/optimism/op-service/eth"
	"github.com/ethereum-optimism/optimism/op-service/testutils"
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/require"
)

// Should be an Oracle implementation
var _ Oracle = (*CachingOracle)(nil)

func TestBlockByHash(t *testing.T) {
	stub, _ := test.NewStubOracle(t)
	oracle := NewCachingOracle(stub)

	rng := rand.New(rand.NewSource(1))
	block, _ := testutils.RandomBlock(rng, 1)

	// Initial call retrieves from the stub
	stub.Blocks[block.Hash()] = block
	actual := oracle.BlockByHash(block.Hash())
	require.Equal(t, block, actual)

	// Later calls should retrieve from cache
	delete(stub.Blocks, block.Hash())
	actual = oracle.BlockByHash(block.Hash())
	require.Equal(t, block, actual)
}

func TestNodeByHash(t *testing.T) {
	stub, stateStub := test.NewStubOracle(t)
	oracle := NewCachingOracle(stub)

	node := []byte{12, 3, 4}
	hash := common.Hash{0xaa}

	// Initial call retrieves from the stub
	stateStub.Data[hash] = node
	actual := oracle.NodeByHash(hash)
	require.Equal(t, node, actual)

	// Later calls should retrieve from cache
	delete(stateStub.Data, hash)
	actual = oracle.NodeByHash(hash)
	require.Equal(t, node, actual)
}

func TestCodeByHash(t *testing.T) {
	stub, stateStub := test.NewStubOracle(t)
	oracle := NewCachingOracle(stub)

	node := []byte{12, 3, 4}
	hash := common.Hash{0xaa}

	// Initial call retrieves from the stub
	stateStub.Code[hash] = node
	actual := oracle.CodeByHash(hash)
	require.Equal(t, node, actual)

	// Later calls should retrieve from cache
	delete(stateStub.Code, hash)
	actual = oracle.CodeByHash(hash)
	require.Equal(t, node, actual)
}

func TestOutputByRoot(t *testing.T) {
	stub, _ := test.NewStubOracle(t)
	oracle := NewCachingOracle(stub)

	rng := rand.New(rand.NewSource(1))
	output := testutils.RandomOutputV0(rng)

	// Initial call retrieves from the stub
	root := common.Hash(eth.OutputRoot(output))
	stub.Outputs[root] = output
	actual := oracle.OutputByRoot(root)
	require.Equal(t, output, actual)

	// Later calls should retrieve from cache
	delete(stub.Outputs, root)
	actual = oracle.OutputByRoot(root)
	require.Equal(t, output, actual)
}
