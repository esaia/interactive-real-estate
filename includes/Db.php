<?php


if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

class Irep_DB
{
    private $table;
    private $wpdb;
    private $where = [];
    private $offset = 0;
    private $limit = null;
    private $orderBy = null;

    public function __construct($table)
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table = $wpdb->prefix . $table;
    }

    public static function table($table)
    {
        return new self($table);
    }

    public function create($data)
    {
        $this->wpdb->insert($this->table, $data);
        return $this->wpdb->insert_id;
    }




    public function update($data)
    {
        if (empty($this->where)) {
            return false; // Prevent updating all rows if no conditions provided
        }

        // Save current conditions and then reset them
        $conditions = $this->where;
        $this->where = [];

        $where = [];

        foreach ($conditions as $condition) {
            $where[$condition['column']] = $condition['value'];
        }


        $this->wpdb->update($this->table, $data, $where);

        return $this->wpdb;
    }


    public function delete()
    {
        if (empty($this->where)) {
            return false; // Prevent deleting all rows
        }

        $conditions = $this->where;
        $this->where = []; // Reset for next query

        $where = [];

        foreach ($conditions as $condition) {
            $where[$condition['column']] = $condition['value'];
        }


        $this->wpdb->delete($this->table, $where);

        return $this->wpdb;
    }

    public function where($column, $operator = '=', $value = null)
    {
        if ($value === null) {
            $value = $operator;
            $operator = '=';
        }

        $this->where[] = [
            'column' => $column,
            'operator' => $operator,
            'value' => $value
        ];
        return $this;
    }

    public function get($columns = '*')
    {
        $whereClause = '';
        $params = [];


        if (!empty($this->where)) {
            $whereParts = [];
            foreach ($this->where as $condition) {
                if ($condition['value'] === 'NULL') {
                    $placeholder = 'null';
                } else {
                    $placeholder = is_numeric($condition['value']) ? '%d' : '%s';
                }

                $whereParts[] = "`{$condition['column']}` {$condition['operator']} {$placeholder}";

                if ($condition['value'] !== 'NULL') {
                    $params[] = is_numeric($condition['value']) ? (int) $condition['value'] : $condition['value'];
                }
            }
            $whereClause = 'WHERE ' . implode(' AND ', $whereParts);
        }


        $orderBy = '';
        if ($this->orderBy) {
            $orderBy = $this->orderBy ? "ORDER BY {$this->orderBy}" : "";
        }


        $limitSql = "";

        if ($this->limit) {
            $limitSql = "LIMIT %d";
            $params[] = $this->limit;

            if ($this->offset) {
                $limitSql .= " OFFSET %d";
                $params[] = $this->offset;
            }
        }

        $sql = "SELECT {$columns} FROM {$this->table} {$whereClause} {$orderBy} {$limitSql}";

        return $this->wpdb->get_results($this->wpdb->prepare($sql, ...$params));
    }


    public function paginate($page, $perPage = 10)
    {

        // Calculate offset
        $offset = ($page - 1) * $perPage;
        $total = $this->count();



        $this->limit($perPage, $offset);

        $data = $this->get();


        return [
            'data'          => $data,
            'total'         => $total,
            'per_page'      => $perPage,
            'page'          => (int)$page,
            'total_pages'   => ceil($total / $perPage),
        ];
    }



    public function find($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = %d LIMIT 1";
        return $this->wpdb->get_row($this->wpdb->prepare($sql, $id), ARRAY_A);
    }

    public function count()
    {
        return count($this->get());
    }

    public function orderBy($column, $direction = 'ASC')
    {
        $this->orderBy = "`$column` $direction";
        return $this;
    }

    public function limit($limit, $offset = 0)
    {
        $this->limit = (int)$limit;
        $this->offset = (int)$offset;
        return $this;
    }
}
