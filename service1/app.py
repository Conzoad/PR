from flask import Flask, request, jsonify

app = Flask(__name__)

items = []

@app.route('/items', methods=['GET'])
def get_items():
    return jsonify(items)

@app.route('/items', methods=['POST'])
def create_item():
    item = request.json
    items.append(item)
    return jsonify(item), 201

@app.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item = request.json
    items[item_id] = item
    return jsonify(item)

@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = items.pop(item_id)
    return jsonify(item)

@app.route('/items/count', methods=['GET'])
def count_items():
    return jsonify({'count': len(items)})

@app.route('/items/filter', methods=['GET'])
def filter_items():
    value = request.args.get('value')
    filtered_items = [item for item in items if item.get('value') == value]
    return jsonify(filtered_items)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 