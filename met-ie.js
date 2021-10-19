module.exports = function(RED) {
    function MetIe(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function(msg) {
            msg.payload = "HELLO WORLD";
            node.send(msg);
        });
    }

    RED.nodes.registerType("met-ie", MetIe);
}
