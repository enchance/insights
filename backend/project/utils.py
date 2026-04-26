import json, arrow
from datetime import datetime, date
from functools import reduce
from typing import Any
from faker import Faker
from project import ic


fake = Faker()


def deep_get(d, *keys, default=None):
    """
    Get a value from a nested dictionary.
    If any of the parents don't exist then the value is None

    Example

    >>> deep_get({'a': {'b': 2}}, 'a', 'b')

    """
    return reduce(lambda acc, key: acc.get(key, {}) if isinstance(acc, dict) else default, keys, d) or default


def truncate(text: str, maxlen: int = 100, suffix: str = '...'):
    return f'{text[:maxlen]}{suffix}' if len(text) > maxlen else text


def split_fullname(fullname: str | None, default: str = '',
                   prefix: str | list | tuple | None = None,
                   suffix: str | list | tuple | None = None) -> tuple:
    """
    Splits a fullname into their respective first_name and last_name fields.
    If only one name is given, that becomes the first_name
    :param fullname:    The name to split
    :param default:     The value if only one name is given
    :param prefix:      Custom prefixes to append to the default list
    :param suffix:      Custom suffixes to append to the default list
    :return:            tuple
    """
    if not fullname:
        return '', ''

    if prefix and not isinstance(prefix, (str, list, tuple)):
        raise TypeError('`prefix` must be a list/str for multi/single values.')

    if suffix and not isinstance(suffix, (str, list, tuple)):
        raise TypeError('`suffix` must be a list/str for multi/single values.')

    prefix = isinstance(prefix, str) and [prefix] or prefix or []
    suffix = isinstance(suffix, str) and [suffix] or suffix or []
    prefix_lastname = ['dos', 'de', 'delos', 'san', 'dela', 'dona', 'van', 'von', 'der', 'de la', 'bin', 'ben', 'al',
                       'Mc', 'O\'', 'Le', 'Mac', 'St.', 'St', 'La', 'L\'', 'L', 'Da', 'D\'', 'D', 'Te', 'Ibn', 'I',
                       *prefix]
    suffix_lastname = ['phd', 'md', 'rn', 'jr', 'sr', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'esq',
                       *suffix]

    list_ = fullname.split()
    lastname_idx = None
    if len(list_) > 2:
        for idx, val in enumerate(list_):
            if val.lower() in prefix_lastname:
                lastname_idx = idx
                break
            elif val.lower().replace('.', '') in suffix_lastname:
                lastname_idx = idx - 1
            else:
                if idx == len(list_) - 1:
                    lastname_idx = idx
                else:
                    continue
        list_[:lastname_idx] = [' '.join(list_[:lastname_idx])]
        list_[1:] = [' '.join(list_[1:])]
    try:
        first, last = list_
    except ValueError:
        first, last = [*list_, default]
    return first, last


def name_extractor(email: str, **kwargs) -> tuple[str, str, str, dict]:
    """
    Try to extract the name of the user from their email.
    :param email:   Account email
    :param kwargs:  Overridden values
    :return:        tuple
    """
    email_user = str(email).split('@')[0]
    email_host = str(email).split('@')[1]
    kwargs['email_host'] = email_host
    firstname = kwargs.pop('firstname', '')
    lastname = kwargs.pop('lastname', '')

    if set(email_user):
        swap = email_user.maketrans({'.': ' ', '_': ' ', '-': ' '})
        firstnm, lastnm = split_fullname(email_user.translate(swap))
        firstname = firstname or firstnm
        lastname = lastname or lastnm

    display = kwargs.pop('display', '') or firstname or email_user.lower()
    if len(display) < 5:
        display = f'{firstname}{lastname}'

    return firstname, lastname, display, kwargs


def modstr(instance, *attr: str, data: list | None = None, onlyid: bool = False, text: str = '') -> str:  # noqa
    """
    The field to display for an object's __str__. If the field doesn't exist then an
    alternative is displayed.
    :param instance:    Instance object
    :param attr:        Field/s name to get data from if it exists
    :param data:        Any data that's not a field
    :param onlyid:      Only return the id
    :param text:        Force the data to show
    :return:            str
    """
    class_name = instance.__class__.__name__
    data = data or []
    ll = [str(getattr(instance, i)) for i in attr if hasattr(instance, i) and getattr(instance, i)]
    ll += [i for i in data if i]

    id_ = instance.id if hasattr(instance, 'id') else '_'

    try:
        if text:
            return f'<{class_name} {id_}: {text}>'
        elif onlyid or not ll:
            return f'<{class_name}: {id_}>'
        return f'<{class_name} {id_}: {", ".join(ll)}>'
    except AttributeError:
        return f'<{class_name}>'


def sql_generator_jsonb(*, to_save: dict[str, Any], table: str, field: str, where: str) -> str:
    """
    Generate the sql needed to update any nested json field.
    Ends with WHERE for security purposes.

    Example:
        ...
        stmt = utils.sql_generator_jsonb(to_save=data_to_save, table=my_table, field='my_json_field',
                                         where='account_id = :id')
        await session.exec(text(stmt), params={'id': 1234})    # noqa
        ...

    :param to_save: The dict to save. If the keys don't exist they will be created.
    :param table:   Table name
    :param field:   Json field to update
    :param where:   The WHERE condition required to limit the query to one row only.
    :return:        Completed query ready to be executed.
    """
    if not where:
        raise Exception('You must set a `where` condition for security')

    table_field = field
    for key, val in to_save.items():
        json_value = json.dumps(val) if not isinstance(val, str) else f'"{val}"'
        field = f"jsonb_set({field}, '{{{key}}}', '{json_value}')"

    # Ends with WHERE
    return f"UPDATE {table} SET {table_field} = {field} WHERE {where}"


def ts_to_datetime(ts: str | int | datetime | None) -> datetime | None:
    if not ts:
        return None
    if isinstance(ts, datetime):
        return ts
    if isinstance(ts, str) and not ts.lstrip('-').isdigit():
        return arrow.get(ts).datetime
    return arrow.get(int(ts) / 1_000_000).datetime


def ts_to_date(ts: str | int | date | None):
    if not ts:
        return None
    if isinstance(ts, datetime):
        return ts.date()
    if isinstance(ts, date):
        return ts
    if isinstance(ts, str) and not ts.lstrip('-').isdigit():
        return arrow.get(ts).date()
    return arrow.get(int(ts) / 1_000_000).date()


def stripstr(val: str | None) -> str | None:
    if val is None:
        return None
    return val.strip()


def to_decimal(val, to_int: bool = False, precision: int = 0) -> float | None:
    """Convert a value to a number, returning None if it cannot be parsed."""
    if val is None:
        return None
    try:
        if to_int:
            return int(float(val))
        result = float(val)
        return round(result, precision) if precision else result
    except (ValueError, TypeError):
        return None


def safeint(val) -> int | None:
    try:
        return int(val)
    except (TypeError, ValueError):
        return None
