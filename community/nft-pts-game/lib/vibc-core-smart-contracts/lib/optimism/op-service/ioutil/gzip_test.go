package ioutil

import (
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestReadWriteWithOptionalCompression(t *testing.T) {
	tests := []struct {
		name       string
		filename   string
		compressed bool
	}{
		{"Uncompressed", "test.notgz", false},
		{"Gzipped", "test.gz", true},
	}
	for _, test := range tests {
		test := test
		t.Run(test.name, func(t *testing.T) {
			data := []byte{1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0, 0}
			dir := t.TempDir()
			path := filepath.Join(dir, test.filename)
			out, err := OpenCompressed(path, os.O_WRONLY|os.O_TRUNC|os.O_CREATE, 0o644)
			require.NoError(t, err)
			defer out.Close()
			_, err = out.Write(data)
			require.NoError(t, err)
			require.NoError(t, out.Close())

			writtenData, err := os.ReadFile(path)
			require.NoError(t, err)
			if test.compressed {
				require.NotEqual(t, data, writtenData, "should have compressed data on disk")
			} else {
				require.Equal(t, data, writtenData, "should not have compressed data on disk")
			}

			in, err := OpenDecompressed(path)
			require.NoError(t, err)
			readData, err := io.ReadAll(in)
			require.NoError(t, err)
			require.Equal(t, data, readData)
		})
	}
}

func TestWriteReadCompressedJson(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		err      string
	}{
		{"Uncompressed", "test.notgz", "does not have .gz extension"},
		{"Gzipped", "test.gz", ""},
	}
	for _, test := range tests {
		test := test
		t.Run(test.name, func(t *testing.T) {
			dir := t.TempDir()
			path := filepath.Join(dir, test.filename)
			err := WriteCompressedJson(path, struct {
				A int
				B string
			}{A: 1, B: "test"})
			if test.err != "" {
				require.ErrorContains(t, err, test.err)
				return
			}
			require.NoError(t, err)

			var read struct {
				A int
				B string
			}
			in, err := OpenDecompressed(path)
			require.NoError(t, err)
			err = json.NewDecoder(in).Decode(&read)
			require.NoError(t, err)
			require.Equal(t, struct {
				A int
				B string
			}{A: 1, B: "test"}, read)
		})
	}
}
