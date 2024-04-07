package l2

import (
	"github.com/ethereum-optimism/optimism/op-service/eth"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/hashicorp/golang-lru/v2/simplelru"
)

// blockCacheSize should be set large enough to handle the pipeline reset process of walking back from L2 head to find
// the L1 origin that is old enough to start buffering channel data from.
const blockCacheSize = 3_000
const nodeCacheSize = 100_000
const codeCacheSize = 10_000

type CachingOracle struct {
	oracle  Oracle
	blocks  *simplelru.LRU[common.Hash, *types.Block]
	nodes   *simplelru.LRU[common.Hash, []byte]
	codes   *simplelru.LRU[common.Hash, []byte]
	outputs *simplelru.LRU[common.Hash, eth.Output]
}

func NewCachingOracle(oracle Oracle) *CachingOracle {
	blockLRU, _ := simplelru.NewLRU[common.Hash, *types.Block](blockCacheSize, nil)
	nodeLRU, _ := simplelru.NewLRU[common.Hash, []byte](nodeCacheSize, nil)
	codeLRU, _ := simplelru.NewLRU[common.Hash, []byte](codeCacheSize, nil)
	outputLRU, _ := simplelru.NewLRU[common.Hash, eth.Output](codeCacheSize, nil)
	return &CachingOracle{
		oracle:  oracle,
		blocks:  blockLRU,
		nodes:   nodeLRU,
		codes:   codeLRU,
		outputs: outputLRU,
	}
}

func (o *CachingOracle) NodeByHash(nodeHash common.Hash) []byte {
	node, ok := o.nodes.Get(nodeHash)
	if ok {
		return node
	}
	node = o.oracle.NodeByHash(nodeHash)
	o.nodes.Add(nodeHash, node)
	return node
}

func (o *CachingOracle) CodeByHash(codeHash common.Hash) []byte {
	code, ok := o.codes.Get(codeHash)
	if ok {
		return code
	}
	code = o.oracle.CodeByHash(codeHash)
	o.codes.Add(codeHash, code)
	return code
}

func (o *CachingOracle) BlockByHash(blockHash common.Hash) *types.Block {
	block, ok := o.blocks.Get(blockHash)
	if ok {
		return block
	}
	block = o.oracle.BlockByHash(blockHash)
	o.blocks.Add(blockHash, block)
	return block
}

func (o *CachingOracle) OutputByRoot(root common.Hash) eth.Output {
	output, ok := o.outputs.Get(root)
	if ok {
		return output
	}
	output = o.oracle.OutputByRoot(root)
	o.outputs.Add(root, output)
	return output
}
